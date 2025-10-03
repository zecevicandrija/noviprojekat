const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/gosti/search?q=ime
// @desc    Pretraži goste po imenu (za autocomplete)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const [gosti] = await pool.execute(
      'SELECT id, ime_prezime, pozicija, kompanija FROM gosti WHERE ime_prezime LIKE ? LIMIT 10',
      [`%${q}%`]
    );
    
    res.json(gosti);
  } catch (error) {
    console.error('Search gosti error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/gosti
// @desc    Dodaj novog gosta (automatski pri dodavanju epizode)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { ime_prezime, pozicija, kompanija, slika_url, biografija, linkedin_url, instagram_url } = req.body;
    
    if (!ime_prezime || !ime_prezime.trim()) {
      return res.status(400).json({ message: 'Ime i prezime su obavezni' });
    }
    
    // Proveri da li već postoji
    const [existing] = await pool.execute(
      'SELECT id FROM gosti WHERE ime_prezime = ?',
      [ime_prezime.trim()]
    );
    
    if (existing.length > 0) {
      return res.status(200).json({ 
        message: 'Gost već postoji',
        id: existing[0].id,
        existing: true
      });
    }
    
    // Insert new gost
    const [result] = await pool.execute(
      'INSERT INTO gosti (ime_prezime, pozicija, kompanija, slika_url, biografija, linkedin_url, instagram_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        ime_prezime.trim(), 
        pozicija || null, 
        kompanija || null, 
        slika_url || null, 
        biografija || null, 
        linkedin_url || null, 
        instagram_url || null
      ]
    );
    
    res.status(201).json({ 
      message: 'Gost uspešno dodat',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Create gost error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/gosti
// @desc    Get sve goste
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [gosti] = await pool.execute('SELECT * FROM gosti ORDER BY ime_prezime ASC');
    res.json(gosti);
  } catch (error) {
    console.error('Get gosti error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/gosti/:id
// @desc    Get jednog gosta
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [gosti] = await pool.execute('SELECT * FROM gosti WHERE id = ?', [id]);
    
    if (gosti.length === 0) {
      return res.status(404).json({ message: 'Gost nije pronađen' });
    }
    
    res.json(gosti[0]);
  } catch (error) {
    console.error('Get gost error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;