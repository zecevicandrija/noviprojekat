// src/app/blog/[slug]/page.js

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPostBySlug, blogPosts } from '../../data/blogPosts';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import BlogCard from '../../components/BlogCard/BlogCard';
import styles from './page.module.css';
import { FaClock, FaCalendar, FaUser, FaArrowLeft } from 'react-icons/fa';

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Blog post nije pronađen',
    };
  }

  return {
    title: `${post.title} | Dijalog Blog`,
    description: post.excerpt,
    keywords: post.keywords.join(', '),
    metadataBase: new URL('https://dijalog.netlify.app'),
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get related posts (excluding current post)
  const relatedPosts = blogPosts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  // Parse content sections
  const sections = post.content.split('\n\n').filter(s => s.trim());

  // Structured Data for SEO (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: post.image,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Dijalog Podcast',
      logo: {
        '@type': 'ImageObject',
        url: 'https://dijalog.netlify.app/logo.png',
      },
    },
    description: post.excerpt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://dijalog.netlify.app/blog/${slug}`,
    },
  };

  return (
    <main className={styles.blogPage}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Navbar />

      {/* Back Button */}
      <div className={styles.backButtonWrapper}>
        <Link href="/" className={styles.backButton}>
          <FaArrowLeft className={styles.backIcon} />
          Nazad na početnu
        </Link>
      </div>

      {/* Hero Section */}
      <article className={styles.article}>
        <header className={styles.header}>
          <div className={styles.categoryBadge}>{post.category}</div>
          <h1 className={styles.title}>{post.title}</h1>
          
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <FaUser className={styles.metaIcon} />
              {post.author}
            </span>
            <span className={styles.metaItem}>
              <FaCalendar className={styles.metaIcon} />
              {formatDate(post.date)}
            </span>
            <span className={styles.metaItem}>
              <FaClock className={styles.metaIcon} />
              {post.readTime}
            </span>
          </div>
        </header>

        {/* Featured Image */}
        <div className={styles.featuredImage}>
          <Image 
            src={post.image} 
            alt={post.title}
            width={1200}
            height={600}
            priority
            className={styles.heroImage}
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          {sections.map((section, index) => {
            // Check if section is a heading
            if (section.startsWith('## ')) {
              const headingText = section.replace('## ', '');
              return (
                <h2 key={index} className={styles.contentHeading}>
                  {headingText}
                </h2>
              );
            }
            
            // Check if section starts with bold text
            if (section.startsWith('**')) {
              return (
                <p key={index} className={styles.paragraph}>
                  {section.split('**').map((part, i) => {
                    if (i % 2 === 1) {
                      return <strong key={i} className={styles.bold}>{part}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            }

            // Regular paragraph
            return (
              <p key={index} className={styles.paragraph}>
                {section}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          {post.keywords.map((keyword, index) => (
            <span key={index} className={styles.tag}>
              #{keyword}
            </span>
          ))}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Slični tekstovi</h2>
          <div className={styles.relatedGrid}>
            {relatedPosts.map(relatedPost => (
              <BlogCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}