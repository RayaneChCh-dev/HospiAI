import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HospiAI - Votre santé, notre priorité intelligente",
    template: "%s | HospiAI"
  },
  description: "Plateforme médicale intelligente pour l'analyse de symptômes et la gestion des soins. Chat IA diagnostic, prises de RDV urgences, historique médical et téléconsultation.",
  keywords: ["santé", "médecine", "IA", "diagnostic", "rendez-vous médical", "téléconsultation", "urgences", "HospiAI"],
  authors: [{ name: "HospiAI Team" }],
  creator: "HospiAI",
  publisher: "HospiAI",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),

  // Open Graph metadata (for Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    title: "HospiAI - Votre santé, notre priorité intelligente",
    description: "Plateforme médicale intelligente pour l'analyse de symptômes et la gestion des soins",
    siteName: "HospiAI",
    images: [
      {
        url: "/doctor-banner.png", // 1200x630px recommended
        width: 1200,
        height: 630,
        alt: "HospiAI - Plateforme médicale intelligente",
      },
      {
        url: "/doctor-post.png", // 1200x1200px for square posts
        width: 1200,
        height: 1200,
        alt: "HospiAI Logo",
      }
    ],
  },

  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "HospiAI - Votre santé, notre priorité intelligente",
    description: "Plateforme médicale intelligente pour l'analyse de symptômes et la gestion des soins",
    images: ["/doctor-banner.png"], // 1200x600px recommended
    creator: "@HospiAI", // Add your Twitter handle here
  },

  // Icons and favicons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/doctor-post.png", sizes: "192x192", type: "image/png" },
      { url: "/doctor-post.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/doctor-post.png", sizes: "180x180", type: "image/png" },
    ],
  },

  // Web app manifest
  manifest: "/manifest.json",

  // Other metadata
  applicationName: "HospiAI",
  category: "medical",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
