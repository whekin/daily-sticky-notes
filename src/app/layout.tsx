import type { Metadata } from "next";
import { Bad_Script, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const badScript = Bad_Script({
  variable: "--font-bad-script",
  weight: "400",
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
      <body
        className={`${manrope.variable} ${playfair.variable} ${badScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
