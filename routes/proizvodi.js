const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/proizvodi
// @desc    Preuzmi sve proizvode
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [proizvodi] = await pool.execute(
      'SELECT * FROM proizvodi ORDER BY created_at DESC'
    );
    res.json(proizvodi);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/proizvodi/:id
// @desc    Preuzmi jedan proizvod
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [proizvodi] = await pool.execute(
      'SELECT * FROM proizvodi WHERE id = ?',
      [id]
    );
    
    if (proizvodi.length === 0) {
      return res.status(404).json({ message: 'Proizvod nije pronađen' });
    }
    
    res.json(proizvodi[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/proizvodi
// @desc    Dodaj novi proizvod
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { naziv, cena, opis, slika_url, zalihe, popularnost } = req.body;
    
    if (!naziv || !cena) {
      return res.status(400).json({ 
        message: 'Naziv i cena su obavezni' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO proizvodi (naziv, cena, opis, slika_url, zalihe, popularnost) VALUES (?, ?, ?, ?, ?, ?)',
      [
        naziv.trim(),
        parseFloat(cena),
        opis || null,
        slika_url || null,
        parseInt(zalihe) || 0,
        parseInt(popularnost) || 0
      ]
    );
    
    res.status(201).json({ 
      message: 'Proizvod uspešno dodat',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/proizvodi/:id
// @desc    Ažuriraj proizvod
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { naziv, cena, opis, slika_url, zalihe, popularnost } = req.body;
    
    if (!naziv || !cena) {
      return res.status(400).json({ 
        message: 'Naziv i cena su obavezni' 
      });
    }
    
    // Proveri da li proizvod postoji
    const [existing] = await pool.execute(
      'SELECT id FROM proizvodi WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Proizvod nije pronađen' });
    }
    
    await pool.execute(
      `UPDATE proizvodi SET 
        naziv = ?,
        cena = ?,
        opis = ?,
        slika_url = ?,
        zalihe = ?,
        popularnost = ?
      WHERE id = ?`,
      [
        naziv.trim(),
        parseFloat(cena),
        opis || null,
        slika_url || null,
        parseInt(zalihe) || 0,
        parseInt(popularnost) || 0,
        id
      ]
    );
    
    res.json({ message: 'Proizvod uspešno ažuriran' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/proizvodi/:id
// @desc    Obriši proizvod
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Proveri da li proizvod postoji
    const [existing] = await pool.execute(
      'SELECT id FROM proizvodi WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Proizvod nije pronađen' });
    }
    
    await pool.execute('DELETE FROM proizvodi WHERE id = ?', [id]);
    
    res.json({ message: 'Proizvod uspešno obrisan' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;