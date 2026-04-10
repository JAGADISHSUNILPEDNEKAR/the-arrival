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

export const metadata: Metadata = {
  title: "The Arrival | Luxury Private Island Restaurant",
  description: "A cinematic scroll experience for a luxury private island restaurant in the Maldives.",
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
      <body className={`${cormorant.variable} antialiased bg-[#060e1a]`}>
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
