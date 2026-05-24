import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: 'swap',
});

const SITE_URL = 'https://the-arrival.vercel.app';
const SITE_TITLE = 'The Arrival — A Private Island Restaurant in the Maldives';
const SITE_DESCRIPTION =
  'A private island restaurant in the Maldives. Reservation is by correspondence.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · The Arrival',
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: 'The Arrival' }],
  applicationName: 'The Arrival',
  category: 'Restaurant',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'The Arrival',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#060e1a',
  colorScheme: 'dark',
};

// Restaurant schema for rich results. The geo coordinates (3.25, 73.0) are
// the same deliberately-rounded Maldives-center lat/lon the Preloader counts
// up to — kept consistent so the structured data tells the same story the
// page tells. The image links to the procedural og image card so search
// previews carry the editorial title-card aesthetic.
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'The Arrival',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image`,
  servesCuisine: ['Maldivian', 'Contemporary', 'Seafood'],
  acceptsReservations: 'https://schema.org/ReservationRequired',
  priceRange: '$$$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MV',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 3.25,
    longitude: 73.0,
  },
};

import { Providers } from "@/components/Providers";
import CustomCursor from "@/components/CustomCursor";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} antialiased bg-[#060e1a]`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <noscript>
          <div
            style={{
              padding: '4rem 2rem',
              maxWidth: '34rem',
              margin: '0 auto',
              fontFamily: 'Georgia, serif',
              color: '#f5f0e8',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>The Arrival</h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              A private island restaurant in the Maldives. The interactive
              experience requires JavaScript.
            </p>
            <p style={{ fontSize: '0.95rem', opacity: 0.75 }}>
              Reservation is by correspondence:{' '}
              <a
                href="mailto:reservations@the-arrival.example"
                style={{ color: '#f5f0e8', textDecoration: 'underline' }}
              >
                reservations@the-arrival.example
              </a>
            </p>
          </div>
        </noscript>
        <CustomCursor />
        <Providers>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
