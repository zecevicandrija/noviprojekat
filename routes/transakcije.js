const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   POST /api/transakcije
// @desc    Kreiraj novu transakciju/narudžbinu
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      ime,
      prezime,
      email,
      telefon,
      adresa,
      grad,
      postanski_broj,
      proizvodi,
      ukupno,
      popust_id
    } = req.body;

    if (!ime || !prezime || !telefon || !adresa || !grad || !postanski_broj || !proizvodi || !ukupno) {
      return res.status(400).json({ 
        message: 'Svi obavezni podaci moraju biti popunjeni' 
      });
    }

    // Proveri zalihe
    for (const item of proizvodi) {
      const [proizvod] = await pool.execute(
        'SELECT zalihe FROM proizvodi WHERE id = ?',
        [item.id]
      );

      if (proizvod.length === 0 || proizvod[0].zalihe < item.kolicina) {
        return res.status(400).json({
          message: `Nedovoljno zaliha za proizvod: ${item.naziv}`
        });
      }
    }

    const korisnik_id = req.user ? req.user.id : null;

    // Kreiraj transakciju
    const [result] = await pool.execute(
      `INSERT INTO transakcije 
      (korisnik_id, ime, prezime, email, telefon, adresa, grad, postanski_broj, 
       proizvodi, ukupno, popust_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        korisnik_id,
        ime,
        prezime,
        email || null,
        telefon,
        adresa,
        grad,
        postanski_broj,
        JSON.stringify(proizvodi),
        ukupno,
        popust_id || null
      ]
    );

    // Smanji zalihe
    for (const item of proizvodi) {
      await pool.execute(
        'UPDATE proizvodi SET zalihe = zalihe - ? WHERE id = ?',
        [item.kolicina, item.id]
      );
    }

    res.status(201).json({
      message: 'Narudžbina uspešno kreirana',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/transakcije/moje
// @desc    Preuzmi transakcije trenutnog korisnika
// @access  Private
router.get('/moje', protect, async (req, res) => {
  try {
    const [transakcije] = await pool.execute(
      `SELECT 
        t.*,
        p.kod as popust_kod,
        p.procenat as popust_procenat
      FROM transakcije t
      LEFT JOIN popusti p ON t.popust_id = p.id
      WHERE t.korisnik_id = ?
      ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    const formatted = transakcije.map(t => ({
      ...t,
      proizvodi: JSON.parse(t.proizvodi)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/transakcije/:id
// @desc    Preuzmi jednu transakciju
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const [transakcije] = await pool.execute(
      `SELECT 
        t.*,
        p.kod as popust_kod,
        p.procenat as popust_procenat
      FROM transakcije t
      LEFT JOIN popusti p ON t.popust_id = p.id
      WHERE t.id = ?`,
      [id]
    );

    if (transakcije.length === 0) {
      return res.status(404).json({ message: 'Transakcija nije pronađena' });
    }

    const transakcija = transakcije[0];

    // Proveri da li korisnik ima pristup
    if (req.user.uloga !== 'admin' && transakcija.korisnik_id !== req.user.id) {
      return res.status(403).json({ message: 'Nemate pristup ovoj transakciji' });
    }

    res.json({
      ...transakcija,
      proizvodi: JSON.parse(transakcija.proizvodi)
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   GET /api/transakcije
// @desc    Preuzmi sve transakcije sa popustima (Admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [transakcije] = await pool.execute(
      `SELECT 
        t.*,
        p.kod as popust_kod,
        p.procenat as popust_procenat
      FROM transakcije t
      LEFT JOIN popusti p ON t.popust_id = p.id
      ORDER BY t.created_at DESC`
    );

    const formatted = transakcije.map(t => ({
      ...t,
      proizvodi: JSON.parse(t.proizvodi)
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

// @route   PUT /api/transakcije/:id/status
// @desc    Ažuriraj status transakcije
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['na_cekanju', 'potvrdjeno', 'isporuceno', 'otkazano'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Neispravan status' });
    }

    await pool.execute(
      'UPDATE transakcije SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status ažuriran' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;