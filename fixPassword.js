const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function fixPassword() {
  try {
    const email = 'zecevic144@gmail.com';
    const plainPassword = 'andrija2005';
    
    // Hash lozinke
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    console.log('Ažuriram lozinku za:', email);
    console.log('Nova hash lozinka:', hashedPassword);
    
    // Update lozinke
    await pool.execute(
      'UPDATE korisnici SET lozinka = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Lozinka uspešno ažurirana!');
    console.log('---');
    console.log('Sada možeš da se uloguješ sa:');
    console.log('Email:', email);
    console.log('Lozinka: andrija2005');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPassword();