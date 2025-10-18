export const metadata = {
  title: 'Dijalog — Podcast',
  description: 'Dijalog podcast — razgovori sa kreativnim ljudima o idejama, pameti i veri. Slušaj najnovije epizode, pročitaj transkripte i pretplati se na newsletter.',
  keywords: 'podcast, dijalog, kreativnost, razgovori, ideje, vera, sport, biznis, religija, biblija, knjige',
};

import Image from 'next/image'
import styles from './page.module.css'
import NewsletterForm from './NewsletterForm'
import Footer from './components/Footer/Footer'
import Navbar from './components/Navbar/Navbar'
import ContactForms from './components/ContactForms/ContactForms';
import Multimedia from './components/Multimedia/Multimedia';
import { FaPlay } from 'react-icons/fa';
import Pitanja from './components/Pitanja/Pitanja';
import BlogPreview from './components/BlogPreview/BlogPreview';
import PrijateljiPodcasta from './components/PrijateljiPodcasta/PrijateljiPodcasta';
import DonacijePreview from './components/DonacijePreview/DonacijePreview';
import BibliotekaPreview from './components/BibliotekaPreview/BibliotekaPreview';

export default function Page() {
  return (
    <main className={styles.container}>
      {/* <Navbar /> */}

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h2 className={styles.heroTitle}>Dijalog Podcast</h2>
            <p className={styles.lead}>Naša ideja je da gledaocima, kroz razgovor sa gostima, prenesemo dobru ili lošu informaciju na adekvatan način kako bi oni sami doneli najbolje zaključke.</p>

            <div className={styles.actions}>
              <a  href="https://www.youtube.com/@dijalog/videos" target="_blank" className={styles.playBtn} aria-label="Pusti najnoviju epizodu"><FaPlay className={styles.playIcon} /> Pusti najnoviju</a>
              <a href="#newsletter" className={styles.subscribe}>Pretplati se</a>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge}>YouTube</span>
            </div>
          </div>

          <div className={styles.heroMedia}>
            <div className={styles.card}>
              <Image src="/Assets/channels4_banner.jpg" alt="Dijalog hero" width={760} height={430} className={styles.heroImage} />
              {/* <div className={styles.glow} /> */}
            </div>
          </div>
        </div>
      </section>

      <section id="epizode" className={styles.section}>
  <h3 className={styles.sectionTitle}>Najnovije epizode</h3>
  <div className={styles.grid}>
    <article className={styles.episodeCard}>
      <a 
        href="https://youtu.be/Oq9OgAyInVo?si=UC-pebisjbUrdmLM" 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.episodeLink}
      >
        <div className={styles.thumb}>
          <Image src="/Assets/dijalogthumb.jpg" alt="Epizoda 1" width={320} height={180} />
        </div>
        <div className={styles.epContent}>
          <h4>dijalog Podcast 107 | DRAGOSLAV BOKAN - Srbi treba da nauče nešto iz istorije ili ćemo propasti</h4>
          <p className={styles.epMeta}>2h 18min • 09.09.2025.</p>
        </div>
      </a>
    </article>

    <article className={styles.episodeCard}>
      <a 
        href="https://youtu.be/bU5tD_yyGww?si=YZmKh5ithiYbpuq6" 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.episodeLink}
      >
        <div className={styles.thumb}>
          <Image src="/Assets/ddd.jpg" alt="Epizoda 2" width={320} height={180} />
        </div>
        <div className={styles.epContent}>
          <h4>{`dijalog 106 | BARBARA O'NEILL - Božija bašta je najbolja apoteka / God's garden is the best pharmacy`}</h4>
          <p className={styles.epMeta}>45min • 18.08.2025.</p>
        </div>
      </a>
    </article>
  </div>
</section>

  
      <section id="newsletter">
          <NewsletterForm />
      </section>
      <section id='pitanja'><Pitanja /></section>
      <Multimedia />
      <section id='prijatelji'>
        <PrijateljiPodcasta />
      </section>
      <section id='donacije'>
        <DonacijePreview />
      </section>
      <section id ='biblioteka'>
        <BibliotekaPreview />
      </section>
      <section id ='kontakt'>
      <ContactForms />
      </section>
      <section id ='blog'>
        <BlogPreview />
      </section>

     {/* <Footer /> */}
    </main>
  )
}