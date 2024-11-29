import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {Ubuntu_Mono} from "next/font/google"
import { Monda } from "next/font/google"
import Navbar from "./components/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const ubuntu = Monda({
  weight: ["400"],
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "ASUNA",
  description: "Your favorite waifu is streaming!",
  viewport: "width=device-width, initial-scale=1.0",
  openGraph: {
    title: "ASUNA",
    description: "Your favorite waifu is streaming!",
    images:
      {
        url: "/metaimage.png",
        width: 1200,
        height: 630,
        alt: "Your favorite waifu is streaming!", 
      },
  },
  twitter: {
    card: "summary_large_image",
    title: "ASUNA",
    description: "Your favorite waifu is streaming!",
    site: "@asunagpt",
    images:
    {
      url: "/metaimage.png",
      width: 1200,
      height: 630,
      alt: "Your favorite waifu is streaming!", 
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={ubuntu.className}
      >
        {children}
      </body>
    </html>
  );
}
