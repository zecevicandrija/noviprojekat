const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS - obavezno PRE routes
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici');
const pitanjaRouter = require('./routes/pitanja');
const pitanjaGroupedRouter = require('./routes/pitanjaGrouped');
const epizodeRouter = require('./routes/epizode');
const gostiRouter = require('./routes/gosti');

app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/pitanja', pitanjaRouter);
app.use('/api/pitanjaGrouped', pitanjaGroupedRouter);
app.use('/api/epizode', epizodeRouter);
app.use('/api/gosti', gostiRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API radi!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta nije pronađena' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Nešto je pošlo naopako!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server pokrenut na portu ${PORT}`);
});