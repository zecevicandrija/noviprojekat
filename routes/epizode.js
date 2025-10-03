const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/epizode
// @desc    Get sve epizode sa gostima (javno)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [epizode] = await pool.execute(`
      SELECT 
        e.*,
        GROUP_CONCAT(
          CONCAT('{"id":', g.id, ',"ime_prezime":"', g.ime_prezime, '","pozicija":"', COALESCE(g.pozicija, ''), '"}')
          SEPARATOR '|'
        ) as gosti_json
      FROM epizode e
      LEFT JOIN epizoda_gost eg ON e.id = eg.epizoda_id
      LEFT JOIN gosti g ON eg.gost_id = g.id
      GROUP BY e.id
      ORDER BY e.datum_objavljivanja DESC
    `);
    
    // Parse gosti JSON
    const result = epizode.map(ep => ({
      ...ep,
      gosti: ep.gosti_json ? ep.gosti_json.split('|').map(g => JSON.parse(g)) : []
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Get epizode error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/epizode/:id
// @desc    Get jednu epizodu sa svim detaljima
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get epizoda
    const [epizode] = await pool.execute(
      'SELECT * FROM epizode WHERE id = ?',
      [id]
    );
    
    if (epizode.length === 0) {
      return res.status(404).json({ message: 'Epizoda nije pronađena' });
    }
    
    // Get gosti za ovu epizodu
    const [gosti] = await pool.execute(`
      SELECT g.* FROM gosti g
      INNER JOIN epizoda_gost eg ON g.id = eg.gost_id
      WHERE eg.epizoda_id = ?
    `, [id]);
    
    // Get citati
    const [citati] = await pool.execute(
      'SELECT * FROM citati WHERE epizoda_id = ?',
      [id]
    );
    
    // Increment broj pregleda
    // await pool.execute(
    //   'UPDATE epizode SET broj_pregleda = broj_pregleda + 1 WHERE id = ?',
    //   [id]
    // );
    
    res.json({
      ...epizode[0],
      //broj_pregleda: epizode[0].broj_pregleda + 1,
      gosti,
      citati
    });
  } catch (error) {
    console.error('Get epizoda details error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/epizode
// @desc    Dodaj novu epizodu (admin)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja, gosti } = req.body;
    
    // Validacija
    if (!naslov || !thumbnail_url || !video_url || !trajanje || !datum_objavljivanja) {
      return res.status(400).json({ message: 'Sva polja su obavezna' });
    }
    
    // Insert epizoda
    const [result] = await pool.execute(
      'INSERT INTO epizode (naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja) VALUES (?, ?, ?, ?, ?)',
      [naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja]
    );
    
    const epizodaId = result.insertId;
    
    // Dodaj goste ako postoje
    if (gosti && gosti.length > 0) {
      for (const gost of gosti) {
        await pool.execute(
          'INSERT INTO epizoda_gost (epizoda_id, gost_id) VALUES (?, ?)',
          [epizodaId, gost.id]
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Epizoda uspešno kreirana',
      id: epizodaId 
    });
  } catch (error) {
    console.error('Create epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/epizode/:id
// @desc    Izmeni epizodu (admin)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja, gosti } = req.body;
    
    // Update epizoda
    await pool.execute(
      'UPDATE epizode SET naslov = ?, thumbnail_url = ?, video_url = ?, trajanje = ?, datum_objavljivanja = ? WHERE id = ?',
      [naslov, thumbnail_url, video_url, trajanje, datum_objavljivanja, id]
    );
    
    // Obriši stare veze sa gostima
    await pool.execute('DELETE FROM epizoda_gost WHERE epizoda_id = ?', [id]);
    
    // Dodaj nove goste
    if (gosti && gosti.length > 0) {
      for (const gost of gosti) {
        await pool.execute(
          'INSERT INTO epizoda_gost (epizoda_id, gost_id) VALUES (?, ?)',
          [id, gost.id]
        );
      }
    }
    
    res.json({ message: 'Epizoda uspešno ažurirana' });
  } catch (error) {
    console.error('Update epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/epizode/:id
// @desc    Obriši epizodu (admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM epizode WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Epizoda nije pronađena' });
    }
    
    res.json({ message: 'Epizoda obrisana' });
  } catch (error) {
    console.error('Delete epizoda error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;