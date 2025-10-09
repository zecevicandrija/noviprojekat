const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/sledeceEpizode/sledeca-epizoda
// @desc    Preuzmi sledeću epizodu (PUBLIC)
// @access  Public
router.get('/sledeca-epizoda', async (req, res) => {
  try {
    const query = `
      SELECT 
        se.datum_epizode,
        g.id as gost_id,
        g.ime_prezime as ime,
        g.pozicija,
        g.kompanija,
        g.slika_url as slika,
        g.biografija as opis,
        g.linkedin_url,
        g.instagram_url,
        g.twitter_url,
        g.youtube_url,
        g.dostignuce_1,
        g.dostignuce_2,
        g.dostignuce_3
      FROM sledeca_epizoda se
      JOIN gosti g ON se.gost_id = g.id
      ORDER BY se.updated_at DESC
      LIMIT 1
    `;

    const [results] = await pool.execute(query);

    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'Nema zakazane sledeće epizode' 
      });
    }

    const epizoda = results[0];

    const response = {
      datumEpizode: epizoda.datum_epizode,
      gost: {
        id: epizoda.gost_id,
        ime: epizoda.ime || '',
        pozicija: epizoda.pozicija || '',
        kompanija: epizoda.kompanija || '',
        slika: epizoda.slika || '/Assets/default-avatar.jpg',
        opis: epizoda.opis || '',
        dostignuca: [
          epizoda.dostignuce_1,
          epizoda.dostignuce_2,
          epizoda.dostignuce_3
        ].filter(d => d !== null && d !== ''),
        socijalniMreza: {
          linkedin: epizoda.linkedin_url || '',
          twitter: epizoda.twitter_url || '',
          instagram: epizoda.instagram_url || '',
          youtube: epizoda.youtube_url || ''
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching sledeca epizoda:', error);
    res.status(500).json({ 
      message: 'Greška prilikom učitavanja sledeće epizode' 
    });
  }
});

// @route   GET /api/sledeceEpizode/admin/sledeca-epizoda
// @desc    Preuzmi podatke za admin panel
// @access  Private/Admin
router.get('/admin/sledeca-epizoda', protect, admin, async (req, res) => {
  try {
    const query = `
      SELECT 
        se.datum_epizode,
        g.id as gost_id,
        g.ime_prezime,
        g.pozicija,
        g.kompanija,
        g.slika_url,
        g.biografija,
        g.linkedin_url,
        g.instagram_url,
        g.twitter_url,
        g.youtube_url,
        g.dostignuce_1,
        g.dostignuce_2,
        g.dostignuce_3
      FROM sledeca_epizoda se
      JOIN gosti g ON se.gost_id = g.id
      ORDER BY se.updated_at DESC
      LIMIT 1
    `;

    const [results] = await pool.execute(query);

    if (results.length === 0) {
      return res.json({
        datumEpizode: '',
        gost: {
          id: null,
          ime: '',
          pozicija: '',
          kompanija: '',
          slika: '',
          opis: '',
          dostignuca: ['', '', ''],
          socijalniMreza: {
            linkedin: '',
            twitter: '',
            instagram: '',
            youtube: ''
          }
        }
      });
    }

    const epizoda = results[0];

    const response = {
      datumEpizode: epizoda.datum_epizode,
      gost: {
        id: epizoda.gost_id,
        ime: epizoda.ime_prezime || '',
        pozicija: epizoda.pozicija || '',
        kompanija: epizoda.kompanija || '',
        slika: epizoda.slika_url || '',
        opis: epizoda.biografija || '',
        dostignuca: [
          epizoda.dostignuce_1 || '',
          epizoda.dostignuce_2 || '',
          epizoda.dostignuce_3 || ''
        ],
        socijalniMreza: {
          linkedin: epizoda.linkedin_url || '',
          twitter: epizoda.twitter_url || '',
          instagram: epizoda.instagram_url || '',
          youtube: epizoda.youtube_url || ''
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching admin sledeca epizoda:', error);
    res.status(500).json({ 
      message: 'Greška prilikom učitavanja podataka' 
    });
  }
});

// @route   POST /api/sledeceEpizode/admin/sledeca-epizoda
// @desc    Sačuvaj/ažuriraj sledeću epizodu
// @access  Private/Admin
router.post('/admin/sledeca-epizoda', protect, admin, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { datumEpizode, gost } = req.body;

    // Validacija
    if (!datumEpizode || !gost || !gost.ime) {
      await connection.rollback();
      return res.status(400).json({ 
        message: 'Datum epizode i ime gosta su obavezni' 
      });
    }

    // Konvertuj datum u MySQL format (YYYY-MM-DD HH:MM:SS)
    const mysqlDate = new Date(datumEpizode).toISOString().slice(0, 19).replace('T', ' ');

    let gostId = gost.id; // Može biti null za novog gosta

    // Ako je gost.id NULL ili undefined, kreiraj novog gosta
    if (!gostId) {
      // Proveri da li već postoji gost sa ovim imenom
      const [existingGost] = await connection.execute(
        'SELECT id FROM gosti WHERE ime_prezime = ?',
        [gost.ime.trim()]
      );

      if (existingGost.length > 0) {
        gostId = existingGost[0].id;
        // Ažuriraj postojećeg gosta
        await connection.execute(`
          UPDATE gosti SET
            pozicija = ?,
            kompanija = ?,
            slika_url = ?,
            biografija = ?,
            linkedin_url = ?,
            instagram_url = ?,
            twitter_url = ?,
            youtube_url = ?,
            dostignuce_1 = ?,
            dostignuce_2 = ?,
            dostignuce_3 = ?
          WHERE id = ?
        `, [
          gost.pozicija || null,
          gost.kompanija || null,
          gost.slika || null,
          gost.opis || null,
          gost.socijalniMreza?.linkedin || null,
          gost.socijalniMreza?.instagram || null,
          gost.socijalniMreza?.twitter || null,
          gost.socijalniMreza?.youtube || null,
          gost.dostignuca?.[0] || null,
          gost.dostignuca?.[1] || null,
          gost.dostignuca?.[2] || null,
          gostId
        ]);
      } else {
        // Kreiraj novog gosta
        const [result] = await connection.execute(`
          INSERT INTO gosti (
            ime_prezime,
            pozicija,
            kompanija,
            slika_url,
            biografija,
            linkedin_url,
            instagram_url,
            twitter_url,
            youtube_url,
            dostignuce_1,
            dostignuce_2,
            dostignuce_3
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          gost.ime.trim(),
          gost.pozicija || null,
          gost.kompanija || null,
          gost.slika || null,
          gost.opis || null,
          gost.socijalniMreza?.linkedin || null,
          gost.socijalniMreza?.instagram || null,
          gost.socijalniMreza?.twitter || null,
          gost.socijalniMreza?.youtube || null,
          gost.dostignuca?.[0] || null,
          gost.dostignuca?.[1] || null,
          gost.dostignuca?.[2] || null
        ]);

        gostId = result.insertId;
      }
    } else {
      // Ažuriraj postojećeg gosta sa poznatim ID-jem
      await connection.execute(`
        UPDATE gosti SET
          ime_prezime = ?,
          pozicija = ?,
          kompanija = ?,
          slika_url = ?,
          biografija = ?,
          linkedin_url = ?,
          instagram_url = ?,
          twitter_url = ?,
          youtube_url = ?,
          dostignuce_1 = ?,
          dostignuce_2 = ?,
          dostignuce_3 = ?
        WHERE id = ?
      `, [
        gost.ime.trim(),
        gost.pozicija || null,
        gost.kompanija || null,
        gost.slika || null,
        gost.opis || null,
        gost.socijalniMreza?.linkedin || null,
        gost.socijalniMreza?.instagram || null,
        gost.socijalniMreza?.twitter || null,
        gost.socijalniMreza?.youtube || null,
        gost.dostignuca?.[0] || null,
        gost.dostignuca?.[1] || null,
        gost.dostignuca?.[2] || null,
        gostId
      ]);
    }

    // Proveri da li sledeca_epizoda već ima zapis
    const [existingEpizoda] = await connection.execute(
      'SELECT id FROM sledeca_epizoda LIMIT 1'
    );

    if (existingEpizoda.length > 0) {
      // Update postojećeg zapisa
      await connection.execute(
        'UPDATE sledeca_epizoda SET datum_epizode = ?, gost_id = ? WHERE id = ?',
        [datumEpizode, gostId, existingEpizoda[0].id]
      );
    } else {
      // Insert novog zapisa
      await connection.execute(
        'INSERT INTO sledeca_epizoda (datum_epizode, gost_id) VALUES (?, ?)',
        [datumEpizode, gostId]
      );
    }

    await connection.commit();

    res.json({ 
      message: 'Sledeća epizoda uspešno sačuvana',
      gostId 
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving sledeca epizoda:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Greška na serveru',
      error: error.message 
    });
  } finally {
    connection.release();
  }
});

// @route   GET /api/sledeceEpizode/admin/gosti/search
// @desc    Pretraži goste za autocomplete
// @access  Private/Admin
router.get('/admin/gosti/search', protect, admin, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const query = `
      SELECT 
        id,
        ime_prezime,
        pozicija,
        kompanija,
        slika_url
      FROM gosti
      WHERE ime_prezime LIKE ?
      ORDER BY ime_prezime
      LIMIT 10
    `;

    const [results] = await pool.execute(query, [`%${q}%`]);

    res.json(results);
  } catch (error) {
    console.error('Error searching gosti:', error);
    res.status(500).json({ 
      message: 'Greška na serveru' 
    });
  }
});

// @route   GET /api/sledeceEpizode/admin/gosti/:id
// @desc    Preuzmi detalje gosta
// @access  Private/Admin
router.get('/admin/gosti/:id', protect, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id,
        ime_prezime,
        pozicija,
        kompanija,
        slika_url,
        biografija,
        linkedin_url,
        instagram_url,
        twitter_url,
        youtube_url,
        dostignuce_1,
        dostignuce_2,
        dostignuce_3
      FROM gosti
      WHERE id = ?
    `;

    const [results] = await pool.execute(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ 
        message: 'Gost nije pronađen' 
      });
    }

    const gost = results[0];

    const response = {
      id: gost.id,
      ime: gost.ime_prezime,
      pozicija: gost.pozicija || '',
      kompanija: gost.kompanija || '',
      slika: gost.slika_url || '',
      opis: gost.biografija || '',
      dostignuca: [
        gost.dostignuce_1 || '',
        gost.dostignuce_2 || '',
        gost.dostignuce_3 || ''
      ],
      socijalniMreza: {
        linkedin: gost.linkedin_url || '',
        twitter: gost.twitter_url || '',
        instagram: gost.instagram_url || '',
        youtube: gost.youtube_url || ''
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching gost details:', error);
    res.status(500).json({ 
      message: 'Greška na serveru' 
    });
  }
});

module.exports = router;