const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/korisnici
// @desc    Get svi korisnici (samo admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, ime, prezime, email, uloga, created_at FROM korisnici ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   DELETE /api/korisnici/:id
// @desc    Obriši korisnika (samo admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    // Ne dozvoli brisanje sopstvenog naloga
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Ne možete obrisati sopstveni nalog' });
    }

    await pool.execute('DELETE FROM korisnici WHERE id = ?', [id]);
    res.json({ message: 'Korisnik obrisan' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;