import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://tikkiguau.com";
const SITE_NAME = "TikkiGuau";
const SITE_TITLE = "TikkiGuau® | Collares y correas personalizados";
const SITE_DESCRIPTION =
  "Collares y correas personalizados para perros y gatos. Elegí colores, letras y emojis, armá el diseño perfecto para tu mascota y hacelo realidad desde casa. Envíos a todo el país.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  keywords: [
    "collares personalizados",
    "correas personalizadas",
    "collares para perros",
    "collares para gatos",
    "accesorios para mascotas",
    "TikkiGuau",
    "collares con nombre",
    "diseñar collar mascota",
    "Argentina",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/images/tikkiguau-logo.png", type: "image/png" }],
  },
  alternates: {
    canonical: "/",
    languages: {
      "es-AR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/hero__banner.png",
        width: 1920,
        height: 1080,
        alt: "Perros con collares personalizados TikkiGuau",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/hero__banner.png",
        alt: "Perros con collares personalizados TikkiGuau",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "og:locale:alternate": "es_ES",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/images/tikkiguau-logo.png`,
      sameAs: ["https://www.instagram.com/tikkiguau/"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+54-9-11-2181-6245",
        areaServed: "AR",
        availableLanguage: ["es"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "es-AR",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
