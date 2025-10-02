// src/app/components/BlogPreview/BlogPreview.js

import Link from 'next/link';
import BlogCard from '../BlogCard/BlogCard';
import { getLatestPosts } from '../../data/blogPosts';
import styles from './BlogPreview.module.css';

export default function BlogPreview() {
  const latestPosts = getLatestPosts(3);

  return (
    <section id="blog" className={styles.blogSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Najnoviji blogovi</h3>
        <Link href="/blog" className={styles.viewAll}>
          Pogledaj sve →
        </Link>
      </div>
      
      <div className={styles.blogGrid}>
        {latestPosts.map(post => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}