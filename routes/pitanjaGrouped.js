const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/auth');

// ========== NAPREDNE HELPER FUNKCIJE ==========

// Normalizacija teksta - proširena
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    // Normalizuj ćiriličko -> latinično
    .replace(/ћ/g, 'c').replace(/ђ/g, 'dj')
    .replace(/ж/g, 'z').replace(/з/g, 'z')
    .replace(/ш/g, 's').replace(/ч/g, 'c')
    .replace(/љ/g, 'lj').replace(/њ/g, 'nj')
    .replace(/џ/g, 'dz')
    // Ukloni dijakritike
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Zameni interpunkciju razmakom
    .replace(/[^\w\s]/g, ' ')
    // Normalizuj whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Proširena lista stop words
function getStopWords() {
  return new Set([
    // Srpski stop words
    'je', 'li', 'da', 'se', 'i', 'u', 'na', 'za', 'o', 'od', 'do',
    'sa', 'kao', 'iz', 'po', 'su', 'koji', 'koja', 'koje', 'šta', 'sta',
    'kako', 'kada', 'zašto', 'zasto', 'gde', 'što', 'sto', 'bi', 'biti',
    'ima', 'može', 'moze', 'hoće', 'hoce', 'će', 'ce', 'ću', 'cu',
    'sam', 'si', 'smo', 'ste', 'bio', 'bila', 'bilo', 'bili',
    'taj', 'ta', 'to', 'ti', 'te', 'one', 'oni', 'ona', 'ono',
    'moj', 'moja', 'moje', 'tvoj', 'tvoja', 'tvoje', 'njegov', 'njen',
    'nas', 'naš', 'vas', 'vaš', 'svoj', 'svoja', 'svoje',
    'neki', 'neka', 'neko', 'svaki', 'svaka', 'svako',
    'jedan', 'jedna', 'jedno', 'prvi', 'prva', 'prvo',
    'dva', 'tri', 'četiri', 'cetiri', 'pet',
    // Engleski stop words
    'the', 'is', 'are', 'was', 'were', 'will', 'can', 'could',
    'have', 'has', 'had', 'your', 'you', 'what', 'when', 'where',
    'why', 'how', 'this', 'that', 'these', 'those', 'with', 'from'
  ]);
}

// Stemming za osnovne srpske sufikse
function simpleStem(word) {
  // Ukloni česte sufikse
  const suffixes = [
    'ovanje', 'ivanje', 'anje', 'enje',
    'osti', 'osti', 'osti', 
    'ama', 'ima', 'ema',
    'om', 'em', 'im',
    'og', 'eg', 'ih',
    'ju', 'cu', 'tu',
    'ao', 'la', 'lo', 'li', 'le',
    'ti', 'ci', 'si',
    'o', 'a', 'e', 'u', 'i'
  ];
  
  let stem = word;
  for (const suffix of suffixes) {
    if (stem.length > 4 && stem.endsWith(suffix)) {
      stem = stem.slice(0, -suffix.length);
      break;
    }
  }
  return stem;
}

// Ekstrakcija ključnih reči sa stemmingom
function extractKeywords(text) {
  const stopWords = getStopWords();
  const normalized = normalizeText(text);
  
  const words = normalized
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .map(word => simpleStem(word));
  
  return [...new Set(words)]; // Ukloni duplikate
}

// N-gram ekstrakcija (bigrams i trigrams)
function extractNGrams(text, n = 2) {
  const words = normalizeText(text).split(/\s+/);
  const ngrams = [];
  
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ');
    if (ngram.length > 5) { // Izbegavaj previše kratke n-grame
      ngrams.push(ngram);
    }
  }
  
  return ngrams;
}

// Levenshtein distance za fuzzy matching
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

// Normalized Levenshtein similarity (0-1)
function levenshteinSimilarity(str1, str2) {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(str1, str2);
  return 1 - (distance / maxLen);
}

// Jaccard similarity (osnovna metrika)
function jaccardSimilarity(set1, set2) {
  if (set1.size === 0 || set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Cosine similarity za n-grame
function cosineSimilarity(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  const allItems = new Set([...arr1, ...arr2]);
  
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allItems.forEach(item => {
    const count1 = arr1.filter(x => x === item).length;
    const count2 = arr2.filter(x => x === item).length;
    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

// ========== GLAVNA FUNKCIJA ZA SLIČNOST ==========
function calculateAdvancedSimilarity(text1, text2) {
  // 1. Keywords similarity (Jaccard)
  const keywords1 = extractKeywords(text1);
  const keywords2 = extractKeywords(text2);
  const keywordScore = jaccardSimilarity(new Set(keywords1), new Set(keywords2));
  
  // 2. Bigram similarity (Cosine)
  const bigrams1 = extractNGrams(text1, 2);
  const bigrams2 = extractNGrams(text2, 2);
  const bigramScore = cosineSimilarity(bigrams1, bigrams2);
  
  // 3. Trigram similarity (Cosine)
  const trigrams1 = extractNGrams(text1, 3);
  const trigrams2 = extractNGrams(text2, 3);
  const trigramScore = cosineSimilarity(trigrams1, trigrams2);
  
  // 4. String similarity (Levenshtein za normalizovane tekstove)
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  const stringScore = levenshteinSimilarity(norm1, norm2);
  
  // Kombinovani weighted score
  // Keywords su najvažniji (40%), zatim bigrami (25%), trigrami (20%), string (15%)
  const finalScore = (
    keywordScore * 0.40 +
    bigramScore * 0.25 +
    trigramScore * 0.20 +
    stringScore * 0.15
  );
  
  return finalScore;
}

// ========== GRUPISANJE PITANJA ==========
function groupSimilarQuestions(pitanja, threshold = 0.35) {
  const groups = [];
  const processed = new Set();

  pitanja.forEach((pitanje, index) => {
    if (processed.has(pitanje.id)) return;

    // Pronađi slična pitanja
    const similar = pitanja.filter((p, i) => {
      if (i <= index || processed.has(p.id)) return false;
      
      const similarity = calculateAdvancedSimilarity(pitanje.pitanje, p.pitanje);
      
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

  // Sortiraj grupe po broju pojavljivanja, zatim po datumu
  return groups.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return new Date(b.firstAsked) - new Date(a.firstAsked);
  });
}

// ========== API ENDPOINT ==========
router.get('/', protect, admin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, ime, pitanje, created_at FROM pitanja_gostima ORDER BY created_at ASC'
    );
    
    // Omogući custom threshold iz query parametra
    const threshold = parseFloat(req.query.threshold) || 0.35;
    const grouped = groupSimilarQuestions(rows, threshold);
    
    res.json(grouped);
  } catch (error) {
    console.error('Get grouped questions error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
});

module.exports = router;