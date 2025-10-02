const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// Helper funkcije za analizu sličnosti
function extractKeywords(text) {
  const stopWords = new Set([
    'je', 'li', 'da', 'se', 'i', 'u', 'na', 'za', 'o', 'od', 'do',
    'sa', 'kao', 'iz', 'po', 'su', 'koji', 'koja', 'koje', 'šta',
    'kako', 'kada', 'zašto', 'gde', 'što', 'bi', 'biti', 'ima', 
    'može', 'hoće', 'će', 'ću', 'the', 'is', 'are', 'was', 'were',
    'will', 'can', 'have', 'has', 'had', 'your', 'you', 'what',
    'when', 'where', 'why', 'how'
  ]);

  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // ukloni dijakritike
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

function calculateSimilarity(keywords1, keywords2) {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity
  return intersection.size / union.size;
}

function groupSimilarQuestions(pitanja, threshold = 0.4) {
  const groups = [];
  const processed = new Set();

  pitanja.forEach((pitanje, index) => {
    if (processed.has(pitanje.id)) return;

    const keywords = extractKeywords(pitanje.pitanje);
    
    // Pronađi slična pitanja
    const similar = pitanja.filter((p, i) => {
      if (i <= index || processed.has(p.id)) return false;
      
      const pKeywords = extractKeywords(p.pitanje);
      const similarity = calculateSimilarity(keywords, pKeywords);
      
      return similarity > threshold;
    });

    // Sortiraj similar po datumu
    similar.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Kreiraj grupu
    const allInstances = [pitanje, ...similar];
    const group = {
      id: pitanje.id,
      reprezentativnoPitanje: pitanje.pitanje,
      autor: pitanje.ime,
      count: allInstances.length,
      firstAsked: pitanje.created_at,
      lastAsked: allInstances.length > 1 
        ? allInstances[allInstances.length - 1].created_at 
        : pitanje.created_at,
      instances: allInstances
    };

    groups.push(group);
    
    // Označi kao procesuirana
    processed.add(pitanje.id);
    similar.forEach(s => processed.add(s.id));
  });

  // Sortiraj grupe po broju pojavljivanja (count), pa po datumu
  return groups.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return new Date(b.firstAsked) - new Date(a.firstAsked);
  });
}

// @route   GET /api/pitanja/grouped
// @desc    Get grupisana pitanja po sličnosti (samo admin)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, ime, pitanje, created_at FROM pitanja_gostima ORDER BY created_at ASC'
    );
    
    const grouped = groupSimilarQuestions(rows);
    
    res.json(grouped);
  } catch (error) {
    console.error('Get grouped questions error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;