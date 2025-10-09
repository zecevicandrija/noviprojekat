function slugify(text) {
  // Mapa za zamenu srpskih slova
  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ђ': 'dj', 'е': 'e',
    'ж': 'z', 'з': 'z', 'и': 'i', 'ј': 'j', 'к': 'k', 'л': 'l', 'љ': 'lj',
    'м': 'm', 'н': 'n', 'њ': 'nj', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's',
    'т': 't', 'ћ': 'c', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'c',
    'џ': 'dz', 'ш': 's',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Ђ': 'Dj', 'Е': 'E',
    'Ж': 'Z', 'З': 'Z', 'И': 'I', 'Ј': 'J', 'К': 'K', 'Л': 'L', 'Љ': 'Lj',
    'М': 'M', 'Н': 'N', 'Њ': 'Nj', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S',
    'Т': 'T', 'Ћ': 'C', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'C',
    'Џ': 'Dz', 'Ш': 'S',
    'č': 'c', 'ć': 'c', 'ž': 'z', 'š': 's', 'đ': 'dj',
    'Č': 'C', 'Ć': 'C', 'Ž': 'Z', 'Š': 'S', 'Đ': 'Dj'
  };

  return text
    .split('')
    .map(char => cyrillicToLatin[char] || char)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Ukloni specijalne karaktere osim space i -
    .replace(/[\s_]+/g, '-')  // Zameni space i _ sa -
    .replace(/^-+|-+$/g, ''); // Ukloni - sa početka i kraja
}

module.exports = slugify;