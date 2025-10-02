'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaChevronLeft, FaChevronRight, FaPlay, FaPause, FaArrowRight } from 'react-icons/fa'
import styles from './Multimedia.module.css'

export default function Multimedia() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  // Podaci za slider - 3 slike sa različitim tekstom
  const slides = [
    {
      id: 1,
      title: "Naš studio",
      description: "Moderni podcast studio opremljen najnovijom tehnologijom za kvalitetan zvuk",
      image: "/Assets/studio.webp"
    },
    {
      id: 2,
      title: "Snimanje u toku",
      description: "Trenutak snimanja sa gostom u prijatnoj i inspirativnoj atmosferi",
      image: "/Assets/studio2.png"
    },
    {
      id: 3,
      title: "Gosti studija",
      description: "Prostor gde se dešavaju razgovori sa zanimljivim ličnostima",
      image: "/Assets/studio3.png"
    }
  ]

  // Video podaci
  const videoData = {
    src: "/Assets/gorki.mp4",
    title: "Podcast Highlight",
    description: "Najbolji momenti direktno iz studija!"
  }

  // Blog podaci
  const blogData = {
    title: "Istražite naš blog",
    description: "Pročitajte zanimljive članke, aktuelnosti i pametne teme.",
    ctaText: "Otkrijte više",
    buttonText: "Posetite Blog",
    link: "/blog"
  }

  // Automatsko prelaženje slajdova
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <section id="multimedia" className={styles.multimedia}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Multimedia</h2>
          <p className={styles.subtitle}>
            Otkrijte najbolje trenutke našeg podcasta kroz ekskluzivne slike i video isečke iz studija
          </p>
        </div>

        <div className={styles.grid}>
          {/* Leva kolona - Slider i Blog sekcija */}
          <div className={styles.leftColumn}>
            {/* Slider kartica */}
            <div className={styles.sliderCard}>
              <div className={styles.sliderContainer}>
                <div className={styles.slider}>
                  {slides.map((slide, index) => (
                    <div
                      key={slide.id}
                      className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                    >
                      <div className={styles.imageWrapper}>
                        <Image
                          src={slide.image || '/Assets/placeholder.jpg'}
                          alt={slide.title}
                          fill
                          className={styles.slideImage}
                        />
                        <div className={styles.slideOverlay}>
                          <div className={styles.slideContent}>
                            <h3 className={styles.slideTitle}>{slide.title}</h3>
                            <p className={styles.slideDescription}>{slide.description}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kontrole slidera */}
                <button className={styles.prevButton} onClick={prevSlide}>
                  <FaChevronLeft />
                </button>
                <button className={styles.nextButton} onClick={nextSlide}>
                  <FaChevronRight />
                </button>

                {/* Play/Pause dugme */}
                <button className={styles.autoplayButton} onClick={toggleAutoplay}>
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>

                {/* Indikatori */}
                <div className={styles.indicators}>
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Blog sekcija - prikazuje se ispod slidera na desktopu */}
            <div className={styles.blogSection}>
              <div className={styles.blogContent}>
                <h3 className={styles.blogTitle}>{blogData.title}</h3>
                <p className={styles.blogDescription}>{blogData.description}</p>
                <p className={styles.blogCta}>{blogData.ctaText}</p>
                <Link href={blogData.link} className={styles.blogButton}>
                  {blogData.buttonText}
                  <FaArrowRight className={styles.buttonIcon} />
                </Link>
              </div>
            </div>
          </div>

          {/* Desna kolona - Video */}
          <div className={styles.rightColumn}>
            <div className={styles.videoCard}>
              <div className={styles.videoContainer}>
                <div className={styles.videoWrapper}>
                  <video
                    className={styles.verticalVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src={videoData.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className={styles.videoOverlay}>
                    <div className={styles.videoBadge}>SHORT</div>
                    <div className={styles.videoContent}>
                      <h3 className={styles.videoTitle}>{videoData.title}</h3>
                      <p className={styles.videoDescription}>{videoData.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blog sekcija za mobile - prikazuje se ispod videa */}
          <div className={styles.blogSectionMobile}>
            <div className={styles.blogContent}>
              <h3 className={styles.blogTitle}>{blogData.title}</h3>
              <p className={styles.blogDescription}>{blogData.description}</p>
              <p className={styles.blogCta}>{blogData.ctaText}</p>
              <Link href={blogData.link} className={styles.blogButton}>
                {blogData.buttonText}
                <FaArrowRight className={styles.buttonIcon} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}