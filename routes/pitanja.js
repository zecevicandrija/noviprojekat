const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/pitanja
// @desc    Get sva pitanja (samo admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, ime, pitanje, created_at FROM pitanja_gostima ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/pitanja
// @desc    Dodaj novo pitanje (javno dostupno)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { ime, pitanje } = req.body;
    
    if (!pitanje || !pitanje.trim()) {
      return res.status(400).json({ message: 'Pitanje je obavezno' });
    }

    const finalIme = ime && ime.trim() ? ime.trim() : 'Anonimno';
    
    const [result] = await pool.execute(
      'INSERT INTO pitanja_gostima (ime, pitanje) VALUES (?, ?)',
      [finalIme, pitanje.trim()]
    );
    
    res.status(201).json({ 
      message: 'Pitanje uspešno poslato',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/pitanja/:id
// @desc    Obriši pitanje (samo admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM pitanja_gostima WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pitanje nije pronađeno' });
    }
    
    res.json({ message: 'Pitanje obrisano' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

router.delete('/clear-all', protect, admin, async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM pitanja_gostima');
    
    res.json({ 
      message: 'Sva pitanja su obrisana',
      deletedCount: result.affectedRows 
    });
  } catch (error) {
    console.error('Clear all questions error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;