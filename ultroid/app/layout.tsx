import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TelegramWrapper } from "@/components/TelegramWrapper";
import { ForceDarkMode } from "@/components/ForceDarkMode";
import Script from 'next/script';
import "./globals.css";
import "./telegram-override.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ultroid Mini App",
  description: "Telegram Mini App for Ultroid Users",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <style>{`
          :root {
            color-scheme: dark;
          }
          html, body {
            background-color: #121212 !important;
            color: #ffffff !important;
          }
        `}</style>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#121212] text-white`}>
        <ForceDarkMode />
        <TelegramWrapper>
          {children}
        </TelegramWrapper>
      </body>
    </html>
  );
}
