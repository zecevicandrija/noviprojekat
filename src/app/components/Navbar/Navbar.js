'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaBars, FaTimes } from 'react-icons/fa'
import styles from './Navbar.module.css'
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (isMenuOpen) {
      // Sačuvaj trenutnu scroll poziciju
      const scrollY = window.pageYOffset
      
      // Fiksniraj body da se ne može skrolovati
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
      
      // Sačuvaj scroll poziciju
      document.body.dataset.scrollY = scrollY.toString()
    } else {
      // Vrati na originalnu scroll poziciju
      const scrollY = parseInt(document.body.dataset.scrollY || '0')
      
      // Resetuj body stilove
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      
      // Vrati na originalnu poziciju
      window.scrollTo(0, scrollY)
      
      // Ukloni data attribute
      delete document.body.dataset.scrollY
    }

    // Cleanup kada se komponenta unmount-uje
    return () => {
      const scrollY = parseInt(document.body.dataset.scrollY || '0')
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, scrollY)
      }
      delete document.body.dataset.scrollY
    }
  }, [isMenuOpen])

  // Dodaj event listener za ESC key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image 
            src="/Assets/dijalog_high.jpg" 
            alt="Dijalog logo" 
            width={48} 
            height={48} 
            className={styles.logo}
          />
          <h1 className={styles.title}>dijalog</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href="/" onClick={closeMenu}>Početna</Link>
          <Link href="/epizode" onClick={closeMenu}>Epizode</Link>
          <Link href="/blog" onClick={closeMenu}>Blog</Link>
          <Link href="/#pitanja" onClick={closeMenu}>Pitanja</Link>
          <Link href="/#kontakt" onClick={closeMenu}>Kontakt</Link>
          <Link href="/shop" className={styles.cta}>Shop</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.overlay} ${isMenuOpen ? styles.overlayOpen : ''}`} onClick={closeMenu} />
      
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileHeader}>
          <div className={styles.brand}>
            <Image 
              src="/Assets/dijalog_high.jpg" 
              alt="Dijalog logo" 
              width={40} 
              height={40} 
              className={styles.logo}
            />
            <h1 className={styles.title}>dijalog</h1>
          </div>
          <button 
            className={styles.menuButton}
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>
        <nav className={styles.mobileNav}>
          <Link href="/" onClick={closeMenu}>Početna</Link>
          <Link href="/epizode" onClick={closeMenu}>Epizode</Link>
          <Link href="/blog" onClick={closeMenu}>Blog</Link>
          <Link href="/#pitanja" onClick={closeMenu}>Pitanja</Link>
          <Link href="/#kontakt" onClick={closeMenu}>Kontakt</Link>
          <Link href="/shop" className={styles.cta} onClick={closeMenu}>Shop</Link>
        </nav>
      </div>
    </>
  )
}