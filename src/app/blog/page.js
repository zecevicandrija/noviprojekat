// src/app/blog/page.js

import { blogPosts } from '../data/blogPosts';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import BlogCard from '../components/BlogCard/BlogCard';
import styles from './page.module.css';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export const metadata = {
  title: 'Blog | Dijalog Podcast',
  description: 'Pročitajte najnovije članke o veri, obrazovanju, zdravlju i životu prema biblijskim principima.',
  keywords: 'blog, dijalog, vera, obrazovanje, zdravlje, biblija, život',
};

export default function BlogPage() {
  // Sort posts by date (newest first)
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <main className={styles.blogListPage}>
      <Navbar />

      <div className={styles.container}>
        {/* Back Button */}
        <Link href="/" className={styles.backButton}>
          <FaArrowLeft className={styles.backIcon} />
          Nazad na početnu
        </Link>

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.title}>Dijalog Blog</h1>
          <p className={styles.subtitle}>
            Najnoviji članci o veri, obrazovanju, zdravlju i životu prema biblijskim principima
          </p>
        </header>

        {/* Blog Grid */}
        <div className={styles.blogGrid}>
          {sortedPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}