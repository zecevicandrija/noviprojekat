const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');
const crypto = require('crypto');

// Helper funkcija: Dodaj 30 dana od danas
function add30Days() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// @route   POST /api/patreon/verify-access
// @desc    Proveri da li korisnik ima pristup premium sadržaju
// @access  Public
router.post('/verify-access', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email je obavezan' });
    }

    // Email validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Nevalidan email format' });
    }
    
    // Proveri da li korisnik postoji i da li je aktivan
    const [korisnici] = await pool.execute(
      `SELECT * FROM patreon_korisnici 
       WHERE email = ? AND status = 'aktivan' 
       AND datum_isteka > NOW()`,
      [email]
    );
    
    if (korisnici.length > 0) {
      res.json({ 
        hasAccess: true, 
        email: korisnici[0].email,
        datum_isteka: korisnici[0].datum_isteka
      });
    } else {
      // Proveri da li je expired
      const [expiredKorisnik] = await pool.execute(
        `SELECT * FROM patreon_korisnici WHERE email = ? AND datum_isteka < NOW()`,
        [email]
      );
      
      if (expiredKorisnik.length > 0) {
        return res.status(403).json({ 
          message: 'Vaša pretplata je istekla. Obnovite na Patreon-u.' 
        });
      }
      
      res.status(403).json({ 
        hasAccess: false,
        message: 'Nemate pristup. Podržite nas na Patreon-u!' 
      });
    }
  } catch (error) {
    console.error('Verify access error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/patreon/webhook
// @desc    Patreon webhook za automatsko dodavanje korisnika
// @access  Public (ali verifikovan Patreon signature)
router.post('/webhook', async (req, res) => {
  try {
    // 1. Verifikuj Patreon signature
    const signature = req.headers['x-patreon-signature'];
    const secret = process.env.PATREON_WEBHOOK_SECRET; // Dodaj u .env
    
    // Compute expected signature
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
    
    // Event types: members:create, members:update, members:delete
    const eventType = data.type;
    
    if (eventType === 'member') {
      const patronStatus = data.attributes.patron_status; // active_patron, declined_patron, former_patron
      const patronEmail = data.attributes.email;
      const patreonUserId = data.relationships.user.data.id;
      
      // Pronađi user email iz "included" (ako nije direktno u data)
      let email = patronEmail;
      if (!email && included) {
        const user = included.find(item => item.type === 'user' && item.id === patreonUserId);
        email = user?.attributes?.email;
      }
      
      if (!email) {
        console.error('Email not found in webhook');
        return res.status(400).json({ message: 'Email missing' });
      }

      // 3. Handle različite statuse
      if (patronStatus === 'active_patron') {
        // Nova uplata ili obnova
        const datumIsteka = add30Days();
        
        await pool.execute(
          `INSERT INTO patreon_korisnici 
           (email, patreon_id, status, datum_uplate, datum_isteka, izvor) 
           VALUES (?, ?, 'aktivan', NOW(), ?, 'webhook')
           ON DUPLICATE KEY UPDATE 
             status = 'aktivan',
             datum_uplate = NOW(),
             datum_isteka = ?,
             patreon_id = ?`,
          [email, patreonUserId, datumIsteka, datumIsteka, patreonUserId]
        );
        
        console.log(`✅ Patron added/renewed: ${email}`);
      } 
      else if (patronStatus === 'declined_patron' || patronStatus === 'former_patron') {
        // Otkazan ili declined - deaktiviraj
        await pool.execute(
          `UPDATE patreon_korisnici 
           SET status = 'neaktivan' 
           WHERE email = ?`,
          [email]
        );
        
        console.log(`❌ Patron deactivated: ${email}`);
      }
    }

    res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Patreon webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
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
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email je obavezan' });
    }

    // Email validacija
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Nevalidan email format' });
    }
    
    const datumIsteka = add30Days();
    
    const [result] = await pool.execute(
      `INSERT INTO patreon_korisnici 
       (email, status, datum_uplate, datum_isteka, izvor) 
       VALUES (?, 'aktivan', NOW(), ?, 'manual')
       ON DUPLICATE KEY UPDATE 
         status = 'aktivan',
         datum_uplate = NOW(),
         datum_isteka = ?`,
      [email, datumIsteka, datumIsteka]
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

// @route   PUT /api/patreon/patrons/:id
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