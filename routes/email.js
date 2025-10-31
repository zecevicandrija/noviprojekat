const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// @route   POST /api/email/general
// @desc    Pošalji generalno pitanje
// @access  Public
router.post('/general', async (req, res) => {
  try {
    const { name, email, question } = req.body;

    if (!name || !email || !question) {
      return res.status(400).json({ 
        message: 'Sva polja su obavezna' 
      });
    }

    await resend.emails.send({
      from: 'noreply@dijalogpodcast.com',
      to: 'zecevic144@gmail.com',
      replyTo: email,
      subject: `[Generalno pitanje] ${name}`,
      html: `
        <h2>Novo generalno pitanje</h2>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Poruka:</strong></p>
        <p>${question.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ 
      message: 'Poruka uspešno poslata!'
    });

  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ 
      message: 'Greška pri slanju poruke. Pokušajte ponovo.'
    });
  }
});

// @route   POST /api/email/sponsorship
// @desc    Pošalji ponudu za sponzorstvo
// @access  Public
router.post('/sponsorship', async (req, res) => {
  try {
    const { name, email, offer } = req.body;

    if (!name || !email || !offer) {
      return res.status(400).json({ 
        message: 'Sva polja su obavezna' 
      });
    }

    await resend.emails.send({
      from: 'noreply@dijalogpodcast.com',
      to: 'zecevic144@gmail.com',
      replyTo: email,
      subject: `[Saradnja/Sponzorstvo] ${name}`,
      html: `
        <h2>Nova ponuda za saradnju/sponzorstvo</h2>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Ponuda:</strong></p>
        <p>${offer.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ 
      message: 'Ponuda uspešno poslata!'
    });

  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ 
      message: 'Greška pri slanju ponude. Pokušajte ponovo.'
    });
  }
});

// @route   POST /api/email/guest
// @desc    Pošalji prijavu za gostovanje
// @access  Public
router.post('/guest', async (req, res) => {
  try {
    const { name, email, about, reason } = req.body;

    if (!name || !email || !about || !reason) {
      return res.status(400).json({ 
        message: 'Sva polja su obavezna' 
      });
    }

    await resend.emails.send({
      from: 'noreply@dijalogpodcast.com',
      to: 'zecevic144@gmail.com',
      replyTo: email,
      subject: `[Prijava za gostovanje] ${name}`,
      html: `
        <h2>Nova prijava za gostovanje</h2>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>O sebi:</strong></p>
        <p>${about.replace(/\n/g, '<br>')}</p>
        <p><strong>Razlog za gostovanje:</strong></p>
        <p>${reason.replace(/\n/g, '<br>')}</p>
      `
    });

    res.status(200).json({ 
      message: 'Prijava uspešno poslata!'
    });

  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ 
      message: 'Greška pri slanju prijave. Pokušajte ponovo.'
    });
  }
});

module.exports = router;