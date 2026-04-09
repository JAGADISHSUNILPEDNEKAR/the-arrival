import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "The Arrival | Luxury Private Island Restaurant",
  description: "A cinematic scroll experience for a luxury private island restaurant in the Maldives.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} antialiased bg-[#060e1a]`}>
        {children}
      </body>
    </html>
  );
}
