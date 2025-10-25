const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/knjige
// @desc    Preuzmi sve knjige
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [knjige] = await pool.execute(
      'SELECT * FROM knjige ORDER BY created_at DESC'
    );
    res.json(knjige);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/knjige/:id
// @desc    Preuzmi jednu knjigu
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const [knjige] = await pool.execute(
      'SELECT * FROM knjige WHERE id = ?',
      [req.params.id]
    );
    
    if (knjige.length === 0) {
      return res.status(404).json({ message: 'Knjiga nije pronađena' });
    }
    
    res.json(knjige[0]);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/knjige
// @desc    Kreiraj novu knjigu
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { ime, autor, url_slike, pdf_url, opis, kategorija } = req.body;
    
    if (!ime || !autor || !url_slike || !pdf_url) {
      return res.status(400).json({ 
        message: 'Ime, autor, URL slike i PDF URL su obavezni' 
      });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO knjige (ime, autor, url_slike, pdf_url, opis, kategorija) VALUES (?, ?, ?, ?, ?, ?)',
      [ime, autor, url_slike, pdf_url, opis || null, kategorija || null]
    );
    
    res.status(201).json({ 
      message: 'Knjiga uspešno kreirana',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/knjige/:id
// @desc    Ažuriraj knjigu
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { ime, autor, url_slike, pdf_url, opis, kategorija } = req.body;
    const { id } = req.params;
    
    if (!ime || !autor || !url_slike || !pdf_url) {
      return res.status(400).json({ 
        message: 'Ime, autor, URL slike i PDF URL su obavezni' 
      });
    }
    
    await pool.execute(
      `UPDATE knjige 
       SET ime = ?, autor = ?, url_slike = ?, pdf_url = ?, opis = ?, kategorija = ?
       WHERE id = ?`,
      [ime, autor, url_slike, pdf_url, opis || null, kategorija || null, id]
    );
    
    res.json({ message: 'Knjiga uspešno ažurirana' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/knjige/:id
// @desc    Obriši knjigu
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM knjige WHERE id = ?', [req.params.id]);
    res.json({ message: 'Knjiga obrisana' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;