import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "@/app/components/SmoothScroll";
import AppProviders from "@/app/components/providers/AppProviders";
import ClientLayout from "./ClientLayout";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "25Zone Shop",
  description: "Static Next.js conversion from HTML pages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>

      <body className="font-spline text-[#1A1A1A] antialiased" suppressHydrationWarning>
        <AppProviders>
          <SmoothScroll />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
