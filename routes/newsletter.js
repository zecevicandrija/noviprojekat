const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// @route   POST /api/newsletter/subscribe
// @desc    Dodaj email u Resend audience
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    
    // Validacija email-a
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email je obavezan' 
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nevalidan email format' 
      });
    }

    // Proveri da li kontakt već postoji
    try {
      const existingContact = await resend.contacts.get({
        email: email,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      });

      if (existingContact) {
        // Ako je unsubscribed, ponovo ga subscribe-uj
        if (existingContact.data.unsubscribed) {
          await resend.contacts.update({
            email: email,
            audienceId: process.env.RESEND_AUDIENCE_ID,
            unsubscribed: false,
          });
          
          return res.status(200).json({ 
            success: true, 
            message: 'Uspešno si se ponovo prijavio! 🎉' 
          });
        }
        
        return res.status(400).json({ 
          success: false, 
          message: 'Već si prijavljen na newsletter!' 
        });
      }
    } catch (checkError) {
      // Ako kontakt ne postoji, nastavlja se sa kreiranjem
      console.log('Kontakt ne postoji, kreiram novog...');
    }

    // Kreiraj novi kontakt
    const contact = await resend.contacts.create({
      email: email,
      firstName: firstName || '',
      lastName: lastName || '',
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    console.log('Newsletter subscription:', contact);

    res.status(201).json({ 
      success: true, 
      message: 'Uspešno si se prijavio! 🎉',
      data: contact 
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Specifične Resend greške
    if (error.message?.includes('already exists')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Već si prijavljen na newsletter!' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Greška prilikom prijave. Pokušaj ponovo.' 
    });
  }
});

// @route   POST /api/newsletter/unsubscribe
// @desc    Odjavi email sa liste
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email je obavezan' 
      });
    }

    await resend.contacts.update({
      email: email,
      audienceId: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: true,
    });

    res.json({ 
      success: true, 
      message: 'Uspešno si se odjavio sa newslettera.' 
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Greška prilikom odjave.' 
    });
  }
});

// @route   GET /api/newsletter/contacts
// @desc    Lista svih kontakata (za admin)
// @access  Public (trebalo bi dodati protect middleware)
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await resend.contacts.list({
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    res.json({ 
      success: true, 
      data: contacts 
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Greška prilikom učitavanja kontakata.' 
    });
  }
});

module.exports = router;