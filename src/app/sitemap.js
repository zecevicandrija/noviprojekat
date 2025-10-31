/**
 * Sitemap za Dijalog Podcast
 * Generiše dinamički sitemap sa svim javnim stranicama
 */

// Glavna domena vašeg sajta
const BASE_URL = 'https://www.dijalogpodcast.com';
const API_URL = 'https://api.dijalogpodcast.com';

/**
 * Funkcija koja generiše sitemap
 * Next.js automatski poziva ovu funkciju i kreira sitemap.xml
 */
export default async function sitemap() {
  try {
    // Učitaj dinamičke podatke iz API-ja
    const [epizode, blogPosts, shopItems] = await Promise.all([
      fetchEpizode(),
      fetchBlogPosts(),
      fetchShopItems(),
    ]);

    // Statičke stranice sa prioritetima
    const staticPages = [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/epizode`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/biblioteka`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/donacije`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/shop`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];

    // Dinamičke stranice - Epizode
    const epizodePages = epizode.map((epizoda) => ({
      url: `${BASE_URL}/epizode/${epizoda.id}`,
      lastModified: epizoda.datum_objavljivanja
        ? new Date(epizoda.datum_objavljivanja)
        : new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    // Dinamičke stranice - Blog
    const blogPages = blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.datum_objavljivanja
        ? new Date(post.datum_objavljivanja)
        : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    // Dinamičke stranice - Shop
    const shopPages = shopItems.map((item) => ({
      url: `${BASE_URL}/shop/${item.id}`,
      lastModified: item.datum_kreiranja
        ? new Date(item.datum_kreiranja)
        : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    // Spoji sve stranice
    return [
      ...staticPages,
      ...epizodePages,
      ...blogPages,
      ...shopPages,
    ];
  } catch (error) {
    console.error('Greška pri generisanju sitemap-a:', error);

    // Ako API ne radi, vrati bar statičke stranice
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/epizode`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/biblioteka`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/donacije`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/shop`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  }
}

/**
 * Pomoćne funkcije za učitavanje podataka iz API-ja
 */

async function fetchEpizode() {
  try {
    const response = await fetch(`${API_URL}/api/epizode`, {
      next: { revalidate: 3600 } // Keširanje 1 sat
    });

    if (!response.ok) {
      throw new Error('API greška');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Greška pri učitavanju epizoda:', error);
    return [];
  }
}

async function fetchBlogPosts() {
  try {
    const response = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 3600 } // Keširanje 1 sat
    });

    if (!response.ok) {
      throw new Error('API greška');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Greška pri učitavanju blog postova:', error);
    return [];
  }
}

async function fetchShopItems() {
  try {
    const response = await fetch(`${API_URL}/api/shop/items`, {
      next: { revalidate: 3600 } // Keširanje 1 sat
    });

    if (!response.ok) {
      throw new Error('API greška');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Greška pri učitavanju shop stavki:', error);
    return [];
  }
}