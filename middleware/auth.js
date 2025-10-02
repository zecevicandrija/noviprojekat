const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Uzmi token iz headera
      token = req.headers.authorization.split(' ')[1];

      // Verifikuj token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Uzmi korisnika iz baze (bez lozinke)
      const [rows] = await pool.execute(
        'SELECT id, ime, prezime, email, uloga FROM korisnici WHERE id = ?',
        [decoded.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ message: 'Korisnik ne postoji' });
      }

      req.user = rows[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Token nije validan' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Niste autorizovani, token nedostaje' });
  }
};

// Middleware za proveru admin uloge
const admin = (req, res, next) => {
  if (req.user && req.user.uloga === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Pristup dozvoljen samo administratorima' });
  }
};

module.exports = { protect, admin };