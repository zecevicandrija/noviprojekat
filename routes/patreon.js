const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');
const crypto = require('crypto');
const axios = require('axios');

// Helper funkcija
function add30Days() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// @route POST /api/patreon/verify-access
router.post('/verify-access', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email je obavezan' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Nevalidan email format' });
    }
    
    // 1. Prvo proveri lokalno u bazi
    const [korisnici] = await pool.execute(
      `SELECT * FROM patreon_korisnici 
       WHERE email = ? AND status = 'aktivan' 
       AND datum_isteka > NOW()`,
      [email]
    );
    
    if (korisnici.length > 0) {
      return res.json({ 
        hasAccess: true, 
        email: korisnici[0].email,
        datum_isteka: korisnici[0].datum_isteka,
        patreon_name: korisnici[0].patreon_name
      });
    }

    // 2. Ako nije u bazi, proveri sa Patreon API-jem
    console.log(`📡 Checking Patreon API for: ${email}`);
    
    const creatorAccessToken = process.env.PATREON_CREATOR_ACCESS_TOKEN;
    const campaignId = process.env.PATREON_CAMPAIGN_ID;

    if (!creatorAccessToken || !campaignId) {
      // Ako nema tokena, samo odbij
      return res.status(403).json({ 
        hasAccess: false,
        message: 'Nemate pristup. Podržite nas na Patreon-u!' 
      });
    }

    try {
      // Preuzmi sve patrona sa Patreon-a
      const response = await axios.get(
        `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members?include=user&fields[member]=full_name,email,patron_status&fields[user]=email,full_name`,
        {
          headers: {
            'Authorization': `Bearer ${creatorAccessToken}`
          }
        }
      );

      const members = response.data.data || [];
      
      // Pronađi patrona po email-u
      const patron = members.find(m => {
        const memberEmail = m.attributes.email;
        return memberEmail && memberEmail.toLowerCase() === email.toLowerCase();
      });

      if (patron && patron.attributes.patron_status === 'active_patron') {
        // Patron je aktivan - dodaj u bazu
        const datumIsteka = add30Days();
        const fullName = patron.attributes.full_name;
        const patreonUserId = patron.relationships?.user?.data?.id;

        await pool.execute(
          `INSERT INTO patreon_korisnici 
           (email, patreon_id, patreon_name, status, datum_uplate, datum_isteka, izvor) 
           VALUES (?, ?, ?, 'aktivan', NOW(), ?, 'verify')
           ON DUPLICATE KEY UPDATE 
             status = 'aktivan',
             patreon_name = ?,
             datum_uplate = NOW(),
             datum_isteka = ?`,
          [email, patreonUserId, fullName, datumIsteka, fullName, datumIsteka]
        );

        console.log(`✅ Patron verified and added: ${email}`);

        return res.json({ 
          hasAccess: true, 
          email: email,
          datum_isteka: datumIsteka,
          patreon_name: fullName
        });
      }
    } catch (apiError) {
      console.error('Patreon API error:', apiError.message);
      // Ako API ne radi, nastavi sa odbijanjem
    }

    // 3. Proveri da li je istekao
    const [expiredKorisnik] = await pool.execute(
      `SELECT * FROM patreon_korisnici WHERE email = ? AND datum_isteka < NOW()`,
      [email]
    );
    
    if (expiredKorisnik.length > 0) {
      return res.status(403).json({ 
        message: 'Vaša pretplata je istekla. Obnovite na Patreon-u.' 
      });
    }
    
    // 4. Nije patron
    res.status(403).json({ 
      hasAccess: false,
      message: 'Nemate pristup. Podržite nas na Patreon-u!' 
    });
    
  } catch (error) {
    console.error('Verify access error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route GET /api/patreon/oauth-url
router.get('/oauth-url', (req, res) => {
  try {
    const clientId = process.env.PATREON_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.PATREON_REDIRECT_URI);
    const scope = encodeURIComponent('identity identity[email] campaigns campaigns.members');
    
    const oauthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    res.json({ url: oauthUrl });
  } catch (error) {
    console.error('OAuth URL error:', error);
    res.status(500).json({ message: 'Greška pri generisanju OAuth URL-a' });
  }
});

// @route GET /api/patreon/callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/donacije?error=no_code`);
    }

    // 1. Razmeni code za access token
    const tokenResponse = await axios.post('https://www.patreon.com/api/oauth2/token', {
      code: code,
      grant_type: 'authorization_code',
      client_id: process.env.PATREON_CLIENT_ID,
      client_secret: process.env.PATREON_CLIENT_SECRET,
      redirect_uri: process.env.PATREON_REDIRECT_URI
    });

    const accessToken = tokenResponse.data.access_token;

    // 2. Preuzmi informacije o korisniku
    const userResponse = await axios.get('https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields[user]=email,full_name&fields[member]=patron_status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const userData = userResponse.data.data;
    const email = userData.attributes.email;
    const fullName = userData.attributes.full_name;
    const patreonId = userData.id;

    // 3. Proveri membership status
    const memberships = userResponse.data.included?.filter(item => item.type === 'member') || [];
    const activeMembership = memberships.find(m => m.attributes.patron_status === 'active_patron');

    if (!activeMembership) {
      return res.redirect(`${process.env.FRONTEND_URL}/donacije?error=not_patron`);
    }

    // 4. Dodaj ili ažuriraj korisnika u bazi
    const datumIsteka = add30Days();
    
    await pool.execute(
      `INSERT INTO patreon_korisnici 
       (email, patreon_id, patreon_name, status, datum_uplate, datum_isteka, izvor) 
       VALUES (?, ?, ?, 'aktivan', NOW(), ?, 'oauth')
       ON DUPLICATE KEY UPDATE 
         status = 'aktivan',
         patreon_name = ?,
         datum_uplate = NOW(),
         datum_isteka = ?,
         patreon_id = ?`,
      [email, patreonId, fullName, datumIsteka, fullName, datumIsteka, patreonId]
    );

    console.log(`✅ OAuth login successful: ${email}`);

    // 5. Redirektuj nazad sa email parametrom
    res.redirect(`${process.env.FRONTEND_URL}/donacije?email=${encodeURIComponent(email)}&success=true`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/donacije?error=oauth_failed`);
  }
});

// @route POST /api/patreon/webhook
router.post('/webhook', async (req, res) => {
  try {
    // 1. Verifikuj Patreon signature
    const signature = req.headers['x-patreon-signature'];
    const secret = process.env.PATREON_WEBHOOK_SECRET;
    
    if (!secret) {
      console.error('PATREON_WEBHOOK_SECRET nije postavljen');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('md5', secret)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Invalid Patreon signature');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Parse webhook data
    const { data, included } = req.body;
    
    if (data.type === 'member') {
      const patronStatus = data.attributes.patron_status;
      const patreonUserId = data.relationships.user.data.id;
      
      // Pronađi user email iz "included"
      let email = null;
      let fullName = null;
      
      if (included) {
        const user = included.find(item => item.type === 'user' && item.id === patreonUserId);
        if (user) {
          email = user.attributes.email;
          fullName = user.attributes.full_name;
        }
      }
      
      if (!email) {
        console.error('Email not found in webhook');
        return res.status(400).json({ message: 'Email missing' });
      }

      // 3. Handle različite statuse
      if (patronStatus === 'active_patron') {
        const datumIsteka = add30Days();
        
        await pool.execute(
          `INSERT INTO patreon_korisnici 
           (email, patreon_id, patreon_name, status, datum_uplate, datum_isteka, izvor) 
           VALUES (?, ?, ?, 'aktivan', NOW(), ?, 'webhook')
           ON DUPLICATE KEY UPDATE 
             status = 'aktivan',
             patreon_name = ?,
             datum_uplate = NOW(),
             datum_isteka = ?,
             patreon_id = ?`,
          [email, patreonUserId, fullName, datumIsteka, fullName, datumIsteka, patreonUserId]
        );
        
        console.log(`✅ Patron added/renewed via webhook: ${email}`);
      } 
      else if (patronStatus === 'declined_patron' || patronStatus === 'former_patron') {
        await pool.execute(
          `UPDATE patreon_korisnici 
           SET status = 'neaktivan' 
           WHERE email = ?`,
          [email]
        );
        
        console.log(`❌ Patron deactivated via webhook: ${email}`);
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Patreon webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
});

// @route POST /api/patreon/sync-members
router.post('/sync-members', protect, admin, async (req, res) => {
  try {
    const creatorAccessToken = process.env.PATREON_CREATOR_ACCESS_TOKEN;
    const campaignId = process.env.PATREON_CAMPAIGN_ID;

    if (!creatorAccessToken || !campaignId) {
      return res.status(500).json({ 
        message: 'PATREON_CREATOR_ACCESS_TOKEN ili PATREON_CAMPAIGN_ID nisu postavljeni' 
      });
    }

    console.log('🔄 Starting sync with Patreon...');
    console.log('Campaign ID:', campaignId);

    // VAŽNO: Koristi paginaciju jer može biti više od 20 patrona
    let allMembers = [];
    let nextUrl = `https://www.patreon.com/api/oauth2/v2/campaigns/${campaignId}/members?include=user,currently_entitled_tiers&fields[member]=full_name,is_follower,email,patron_status&fields[user]=email,full_name`;

    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: {
          'Authorization': `Bearer ${creatorAccessToken}`
        }
      });

      const members = response.data.data || [];
      const included = response.data.included || [];

      console.log(`📦 Fetched ${members.length} members in this batch`);

      // Procesuj svaki member
      for (const member of members) {
        const patronStatus = member.attributes.patron_status;
        const memberEmail = member.attributes.email; // Email iz member objekta
        const fullName = member.attributes.full_name;
        const patreonUserId = member.relationships?.user?.data?.id;

        // Pokušaj uzeti email iz member attributes ili iz user objekta
        let email = memberEmail;

        if (!email && patreonUserId && included) {
          const user = included.find(item => item.type === 'user' && item.id === patreonUserId);
          if (user && user.attributes) {
            email = user.attributes.email;
          }
        }

        allMembers.push({
          id: member.id,
          email: email,
          fullName: fullName,
          patronStatus: patronStatus,
          patreonUserId: patreonUserId
        });
      }

      // Proveri da li ima još stranica (paginacija)
      nextUrl = response.data.links?.next || null;
      if (nextUrl) {
        console.log('📄 Fetching next page...');
      }
    }

    console.log(`📊 Total members fetched: ${allMembers.length}`);

    let synced = 0;
    let errors = 0;
    let errorDetails = [];

    for (const member of allMembers) {
      try {
        console.log(`\n🔍 Processing: ${member.email || 'NO EMAIL'} (Status: ${member.patronStatus})`);

        if (!member.email) {
          const errorMsg = `Email not found`;
          console.log(`   ❌ ${errorMsg}`);
          errorDetails.push({ 
            memberId: member.id, 
            patreonId: member.patreonUserId, 
            error: errorMsg 
          });
          errors++;
          continue;
        }

        if (member.patronStatus === 'active_patron') {
          const datumIsteka = add30Days();
          
          await pool.execute(
            `INSERT INTO patreon_korisnici 
             (email, patreon_id, patreon_name, status, datum_uplate, datum_isteka, izvor) 
             VALUES (?, ?, ?, 'aktivan', NOW(), ?, 'oauth')
             ON DUPLICATE KEY UPDATE 
               status = 'aktivan',
               patreon_name = ?,
               datum_uplate = NOW(),
               datum_isteka = ?,
               patreon_id = ?`,
            [member.email, member.patreonUserId, member.fullName, datumIsteka, member.fullName, datumIsteka, member.patreonUserId]
          );
          
          synced++;
          console.log(`   ✅ Synced: ${member.email}`);
        } else {
          console.log(`   ⏭️  Skipped (status: ${member.patronStatus})`);
        }
      } catch (err) {
        console.error(`   ❌ Error syncing ${member.email}:`, err.message);
        errorDetails.push({ 
          email: member.email, 
          error: err.message 
        });
        errors++;
      }
    }

    console.log('\n✅ Sync completed');
    console.log(`   Synced: ${synced}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${allMembers.length}`);

    if (errorDetails.length > 0) {
      console.log('\n⚠️ Error details:', JSON.stringify(errorDetails.slice(0, 10), null, 2));
    }

    res.json({ 
      message: 'Sync completed',
      synced: synced,
      errors: errors,
      total: allMembers.length,
      errorDetails: errorDetails.slice(0, 5)
    });

  } catch (error) {
    console.error('❌ Sync members error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Greška pri sinhronizaciji',
      error: error.response?.data || error.message 
    });
  }
});

// @route   GET /api/patreon/patrons
// @desc    Lista svih patrona (admin)
// @access  Private/Admin
router.get('/patrons', protect, admin, async (req, res) => {
  try {
    const [patrons] = await pool.execute(
      `SELECT * FROM patreon_korisnici ORDER BY created_at DESC`
    );
    
    res.json(patrons);
  } catch (error) {
    console.error('Get patrons error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/patreon/patrons
// @desc    Ručno dodaj patrona (admin)
// @access  Private/Admin
router.post('/patrons', protect, admin, async (req, res) => {
  try {
    const { email, patreon_name } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email je obavezan' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Nevalidan email format' });
    }
    
    const datumIsteka = add30Days();
    
    await pool.execute(
      `INSERT INTO patreon_korisnici 
       (email, patreon_name, status, datum_uplate, datum_isteka, izvor) 
       VALUES (?, ?, 'aktivan', NOW(), ?, 'manual')
       ON DUPLICATE KEY UPDATE 
         status = 'aktivan',
         patreon_name = ?,
         datum_uplate = NOW(),
         datum_isteka = ?`,
      [email, patreon_name || null, datumIsteka, patreon_name || null, datumIsteka]
    );
    
    res.status(201).json({ 
      message: 'Patron uspešno dodat',
      email: email,
      datum_isteka: datumIsteka
    });
  } catch (error) {
    console.error('Add patron error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/patreon/patrons/:id
// @desc    Obriši patrona (admin)
// @access  Private/Admin
router.delete('/patrons/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM patreon_korisnici WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patron nije pronađen' });
    }
    
    res.json({ message: 'Patron obrisan' });
  } catch (error) {
    console.error('Delete patron error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/patreon/patrons/:id/extend
// @desc    Produži pristup patrona za još 30 dana (admin)
// @access  Private/Admin
router.put('/patrons/:id/extend', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const datumIsteka = add30Days();
    
    await pool.execute(
      `UPDATE patreon_korisnici 
       SET datum_isteka = ?, status = 'aktivan' 
       WHERE id = ?`,
      [datumIsteka, id]
    );
    
    res.json({ 
      message: 'Pristup produžen za 30 dana',
      novi_datum_isteka: datumIsteka
    });
  } catch (error) {
    console.error('Extend patron error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;