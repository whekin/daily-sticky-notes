import type { Metadata } from "next";
import { Caveat, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Our Little Valentine",
  description: "A daily note gift that opens one memory at a time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} ${caveat.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
