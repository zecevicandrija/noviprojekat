import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://dijalogpodcast.com'),
  title: {
    default: "Dijalog Podcast - Razgovori o Veri, Biznisu i Kreativnosti",
    template: "%s | Dijalog Podcast"
  },
  description: "Dijalog podcast sa kreativnim ljudima o veri, biznisu, politici, sportu i idejama. Slušaj najnovije epizode, čitaj blog i pretplati se na newsletter. Novi gosti svake nedelje.",
  keywords: [
    "dijalog podcast",
    "dijalog",
    "podcast srbija",
    "vera podcast",
    "biznis podcast",
    "kreativnost",
    "razgovori",
    "intervjui",
    "biblija",
    "religija",
    "politika",
    "sport",
    "knjige",
    "ideje",
    "srpski podcast",
    "balkan podcast"
  ],
  authors: [{ name: "Dijalog Podcast", url: "https://dijalogpodcast.com" }],
  creator: "Dijalog",
  publisher: "Dijalog Podcast",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://dijalogpodcast.com",
  },
  openGraph: {
    title: "Dijalog Podcast - Razgovori o Veri, Biznisu i Kreativnosti",
    description: "Slušaj najnovije epizode Dijalog podcasta. Razgovori sa kreativnim ljudima o veri, biznisu, politici i idejama.",
    url: "https://dijalogpodcast.com",
    siteName: "Dijalog Podcast",
    locale: "sr_RS",
    type: "website",
    images: [
      {
        url: "/Assets/channels4_banner.jpg",
        width: 1200,
        height: 630,
        alt: "Dijalog Podcast"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dijalog Podcast - Razgovori o Veri, Biznisu i Kreativnosti",
    description: "Slušaj najnovije epizode Dijalog podcasta. Razgovori sa kreativnim ljudima.",
    images: ["/Assets/channels4_banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "", // Dodaj ovo posle registracije na Google Search Console
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        {/* Dodatni SEO meta tagovi */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#030c22" />
        
        {/* Preconnect za bolje performanse */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.dijalogpodcast.com" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "PodcastSeries",
              "name": "Dijalog Podcast",
              "description": "Razgovori sa kreativnim ljudima o veri, biznisu, politici i idejama",
              "url": "https://dijalogpodcast.com",
              "image": "https://dijalogpodcast.com/Assets/channels4_banner.jpg",
              "author": {
                "@type": "Organization",
                "name": "Dijalog"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Dijalog Podcast",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://dijalogpodcast.com/Assets/dijalog_high.jpg"
                }
              },
              "inLanguage": "sr",
              "genre": ["Interview", "Talk", "Religion", "Business"],
              "webFeed": "https://www.youtube.com/@dijalog/videos"
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}