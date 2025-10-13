const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/popusti/proveri/:kod
// @desc    Proveri validnost popusta
// @access  Public
// U routes/popusti.js
router.get('/proveri/:kod', async (req, res) => {
  try {
    const { kod } = req.params;
    
    const [popusti] = await pool.execute(
      `SELECT id, procenat, opis FROM popusti 
       WHERE kod = ? 
       AND aktivan = 1 
       AND (datum_isteka IS NULL OR datum_isteka >= CURDATE())
       AND (max_upotreba IS NULL OR trenutna_upotreba < max_upotreba)`,
      [kod.toUpperCase()]
    );
    
    if (popusti.length === 0) {
      return res.status(404).json({ 
        message: 'Popust nije validan ili je istekao' 
      });
    }
    
    res.json({
      id: popusti[0].id, // Dodaj ID
      procenat: popusti[0].procenat,
      opis: popusti[0].opis
    });
  } catch (error) {
    console.error('Error checking discount:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/popusti/iskoristi
// @desc    Iskoristi popust (povećaj brojač)
// @access  Public
router.post('/iskoristi', async (req, res) => {
  try {
    const { kod } = req.body;
    
    await pool.execute(
      'UPDATE popusti SET trenutna_upotreba = trenutna_upotreba + 1 WHERE kod = ?',
      [kod.toUpperCase()]
    );
    
    res.json({ message: 'Popust iskorišćen' });
  } catch (error) {
    console.error('Error using discount:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/popusti
// @desc    Lista svih popusta
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [popusti] = await pool.execute(
      'SELECT * FROM popusti ORDER BY created_at DESC'
    );
    res.json(popusti);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/popusti
// @desc    Kreiraj novi popust
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { kod, procenat, opis, datum_isteka, max_upotreba } = req.body;
    
    if (!kod || !procenat) {
      return res.status(400).json({ message: 'Kod i procenat su obavezni' });
    }
    
    const [result] = await pool.execute(
      'INSERT INTO popusti (kod, procenat, opis, datum_isteka, max_upotreba) VALUES (?, ?, ?, ?, ?)',
      [kod.toUpperCase(), procenat, opis || null, datum_isteka || null, max_upotreba || null]
    );
    
    res.status(201).json({ 
      message: 'Popust uspešno kreiran',
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kod popusta već postoji' });
    }
    console.error('Error creating discount:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/popusti/:id
// @desc    Obriši popust
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await pool.execute('DELETE FROM popusti WHERE id = ?', [req.params.id]);
    res.json({ message: 'Popust obrisan' });
  } catch (error) {
    console.error('Error deleting discount:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { kod, procenat, opis, datum_isteka, max_upotreba, aktivan } = req.body;
    const { id } = req.params;
    
    if (!kod || !procenat) {
      return res.status(400).json({ message: 'Kod i procenat su obavezni' });
    }
    
    await pool.execute(
      `UPDATE popusti 
       SET kod = ?, procenat = ?, opis = ?, datum_isteka = ?, max_upotreba = ?, aktivan = ?
       WHERE id = ?`,
      [
        kod.toUpperCase(), 
        procenat, 
        opis || null, 
        datum_isteka || null, 
        max_upotreba || null,
        aktivan ? 1 : 0,
        id
      ]
    );
    
    res.json({ message: 'Popust uspešno ažuriran' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Kod popusta već postoji' });
    }
    console.error('Error updating discount:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;