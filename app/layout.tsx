import type { Metadata } from "next";
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
  themeColor: '#060e1a',
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

// Restaurant schema for rich results.
const restaurantSchema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'The Arrival',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  servesCuisine: ['Maldivian', 'Contemporary', 'Seafood'],
  acceptsReservations: 'https://schema.org/ReservationRequired',
  priceRange: '$$$$',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MV',
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
