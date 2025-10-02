import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dijalog — Podcast",
  description: "Dijalog podcast — razgovori sa kreativnim ljudima o idejama, biznisu i veri. Slušaj najnovije epizode i pretplati se na newsletter.",
  keywords: "podcast, dijalog, kreativnost, razgovori, ideje, vera, sport, biznis, religija, biblija, knjige, politika",
  authors: [{ name: "Dijalog Podcast" }],
  creator: "Dijalog",
  publisher: "Dijalog",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dijalog — Podcast",
    description: "Dijalog podcast — razgovori sa kreativnim ljudima o idejama, pameti i veri.",
    url: "https://dijalog.netlify.app",
    siteName: "Dijalog Podcast",
    locale: "sr_RS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dijalog — Podcast",
    description: "Dijalog podcast — razgovori sa kreativnim ljudima o idejama, pameti i veri.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Viewport konfiguracija - KLJUČNO za iOS
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Važno za iPhone sa notch-om
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <head>
        {/* Dodatni meta tagovi za iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#030c22" />
        
        {/* Preconnect za eksterne fontove ako ih koristiš */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}