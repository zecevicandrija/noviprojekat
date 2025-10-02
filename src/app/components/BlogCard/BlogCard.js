// src/app/components/BlogCard/BlogCard.js

import Image from 'next/image';
import Link from 'next/link';
import styles from './BlogCard.module.css';
import { FaClock, FaCalendar } from 'react-icons/fa';

export default function BlogCard({ post }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-Latn-RS', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <article className={styles.blogCard}>
      <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <Image 
            src={post.image} 
            alt={post.title} 
            width={400} 
            height={225}
            className={styles.cardImage}
          />
          <div className={styles.categoryBadge}>{post.category}</div>
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.cardExcerpt}>{post.excerpt}</p>
          
          <div className={styles.cardMeta}>
            <span className={styles.metaItem}>
              <FaCalendar className={styles.metaIcon} />
              {formatDate(post.date)}
            </span>
            <span className={styles.metaItem}>
              <FaClock className={styles.metaIcon} />
              {post.readTime}
            </span>
          </div>

          <span className={styles.readMore}>Pročitaj više →</span>
        </div>
      </Link>
    </article>
  );
}