const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// Helper funkcija: Generiši slug iz naslova
function generateSlug(naslov) {
  return naslov
    .toLowerCase()
    .normalize('NFD') // Normalizuj unicode
    .replace(/[\u0300-\u036f]/g, '') // Ukloni diakritike
    .replace(/đ/g, 'd')
    .replace(/ž/g, 'z')
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Ukloni spec karaktere
    .trim()
    .replace(/\s+/g, '-') // Razmaci → crtice
    .replace(/-+/g, '-') // Višestruke crtice → jedna
    .slice(0, 200); // Max 200 karaktera
}

// @route   GET /api/premium-epizode
// @desc    Get sve premium epizode (samo za Patreon korisnike)
// @access  Protected (email verifikacija)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    // Provera email-a
    if (!email) {
      return res.status(401).json({ message: 'Email nije prosleđen' });
    }
    
    // Provera pristupa
    const [korisnici] = await pool.execute(
      `SELECT * FROM patreon_korisnici 
       WHERE email = ? AND status = 'aktivan' 
       AND datum_isteka > NOW()`,
      [email]
    );
    
    if (korisnici.length === 0) {
      return res.status(403).json({ 
        message: 'Nemate pristup premium sadržaju. Podržite nas na Patreon-u!' 
      });
    }
    
    // Vrati premium epizode
    const [epizode] = await pool.execute(
      `SELECT * FROM premium_epizode 
       ORDER BY datum_objavljivanja DESC`
    );
    
    res.json(epizode);
  } catch (error) {
    console.error('Get premium epizode error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/premium-epizode/:id
// @desc    Get jednu premium epizodu
// @access  Protected (email verifikacija)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({ message: 'Email nije prosleđen' });
    }
    
    // Provera pristupa
    const [korisnici] = await pool.execute(
      `SELECT * FROM patreon_korisnici 
       WHERE email = ? AND status = 'aktivan' 
       AND datum_isteka > NOW()`,
      [email]
    );
    
    if (korisnici.length === 0) {
      return res.status(403).json({ message: 'Nemate pristup' });
    }
    
    // Get epizoda
    const [epizode] = await pool.execute(
      'SELECT * FROM premium_epizode WHERE id = ?',
      [id]
    );
    
    if (epizode.length === 0) {
      return res.status(404).json({ message: 'Epizoda nije pronađena' });
    }
    
    res.json(epizode[0]);
  } catch (error) {
    console.error('Get premium epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/premium-epizode
// @desc    Dodaj novu premium epizodu (admin)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja, opis } = req.body;
    
    // Validacija
    if (!naslov || !thumbnail_url || !video_url || !trajanje || !datum_objavljivanja) {
      return res.status(400).json({ message: 'Sva obavezna polja moraju biti popunjena' });
    }
    
    // Generiši slug
    const slug = generateSlug(naslov);
    
    // Insert
    const [result] = await pool.execute(
      `INSERT INTO premium_epizode 
       (naslov, slug, thumbnail_url, video_url, trajanje, datum_objavljivanja, opis) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [naslov, slug, thumbnail_url, video_url, trajanje, datum_objavljivanja, opis || null]
    );
    
    res.status(201).json({ 
      message: 'Premium epizoda uspešno kreirana',
      id: result.insertId,
      slug: slug
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Epizoda sa ovim slug-om već postoji' });
    }
    console.error('Create premium epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/premium-epizode/:id
// @desc    Izmeni premium epizodu (admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja, opis } = req.body;
    
    // Validacija
    if (!naslov || !thumbnail_url || !video_url || !trajanje || !datum_objavljivanja) {
      return res.status(400).json({ message: 'Sva obavezna polja moraju biti popunjena' });
    }
    
    // Generiši novi slug
    const slug = generateSlug(naslov);
    
    // Update
    const [result] = await pool.execute(
      `UPDATE premium_epizode 
       SET naslov = ?, slug = ?, thumbnail_url = ?, video_url = ?, 
           trajanje = ?, datum_objavljivanja = ?, opis = ?
       WHERE id = ?`,
      [naslov, slug, thumbnail_url, video_url, trajanje, datum_objavljivanja, opis || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Epizoda nije pronađena' });
    }
    
    res.json({ 
      message: 'Premium epizoda uspešno ažurirana',
      slug: slug
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Epizoda sa ovim slug-om već postoji' });
    }
    console.error('Update premium epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/premium-epizode/:id
// @desc    Obriši premium epizodu (admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM premium_epizode WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Epizoda nije pronađena' });
    }
    
    res.json({ message: 'Premium epizoda uspešno obrisana' });
  } catch (error) {
    console.error('Delete premium epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/premium-epizode/admin/all
// @desc    Get sve premium epizode za admin panel (bez email provere)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const [epizode] = await pool.execute(
      `SELECT * FROM premium_epizode 
       ORDER BY datum_objavljivanja DESC`
    );
    
    res.json(epizode);
  } catch (error) {
    console.error('Get admin premium epizode error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;