const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// Generisanje JWT tokena
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Registracija novog korisnika
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { ime, prezime, email, lozinka } = req.body;

    // Validacija
    if (!ime || !prezime || !email || !lozinka) {
      return res.status(400).json({ message: 'Molimo popunite sva polja' });
    }

    // Proveri da li korisnik već postoji
    const [existingUser] = await pool.execute(
      'SELECT id FROM korisnici WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Korisnik sa ovim emailom već postoji' });
    }

    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(lozinka, salt);

    // Kreiraj korisnika
    const [result] = await pool.execute(
      'INSERT INTO korisnici (ime, prezime, email, lozinka, uloga) VALUES (?, ?, ?, ?, ?)',
      [ime, prezime, email, hashedPassword, 'korisnik']
    );

    const userId = result.insertId;

    // Uzmi kreiranog korisnika
    const [newUser] = await pool.execute(
      'SELECT id, ime, prezime, email, uloga FROM korisnici WHERE id = ?',
      [userId]
    );

    const token = generateToken(userId);

    res.status(201).json({
      user: newUser[0],
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   POST /api/auth/login
// @desc    Login korisnika
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    // Validacija
    if (!email || !lozinka) {
      return res.status(400).json({ message: 'Molimo unesite email i lozinku' });
    }

    // Proveri korisnika
    const [rows] = await pool.execute(
      'SELECT * FROM korisnici WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Neispravni kredencijali' });
    }

    const user = rows[0];

    // Proveri lozinku
    const isMatch = await bcrypt.compare(lozinka, user.lozinka);

    if (!isMatch) {
      return res.status(401).json({ message: 'Neispravni kredencijali' });
    }

    // Generiši token
    const token = generateToken(user.id);

    res.json({
      user: {
        id: user.id,
        ime: user.ime,
        prezime: user.prezime,
        email: user.email,
        uloga: user.uloga
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/auth/me
// @desc    Get trenutnog korisnika
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/auth/update
// @desc    Update profila korisnika
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    const { ime, prezime, email } = req.body;
    const userId = req.user.id;

    // Proveri da li novi email već postoji (osim za trenutnog korisnika)
    if (email && email !== req.user.email) {
      const [existingUser] = await pool.execute(
        'SELECT id FROM korisnici WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email već postoji' });
      }
    }

    // Update korisnika
    await pool.execute(
      'UPDATE korisnici SET ime = ?, prezime = ?, email = ? WHERE id = ?',
      [ime || req.user.ime, prezime || req.user.prezime, email || req.user.email, userId]
    );

    // Uzmi ažuriranog korisnika
    const [updatedUser] = await pool.execute(
      'SELECT id, ime, prezime, email, uloga FROM korisnici WHERE id = ?',
      [userId]
    );

    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Promena lozinke
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { staraLozinka, novaLozinka } = req.body;
    const userId = req.user.id;

    if (!staraLozinka || !novaLozinka) {
      return res.status(400).json({ message: 'Molimo unesite staru i novu lozinku' });
    }

    // Uzmi trenutnu lozinku
    const [rows] = await pool.execute(
      'SELECT lozinka FROM korisnici WHERE id = ?',
      [userId]
    );

    const user = rows[0];

    // Proveri staru lozinku
    const isMatch = await bcrypt.compare(staraLozinka, user.lozinka);

    if (!isMatch) {
      return res.status(401).json({ message: 'Stara lozinka nije ispravna' });
    }

    // Hash nove lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(novaLozinka, salt);

    // Update lozinke
    await pool.execute(
      'UPDATE korisnici SET lozinka = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Lozinka uspešno promenjena' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;