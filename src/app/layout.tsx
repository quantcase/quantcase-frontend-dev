import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/molecules/app-sidebar";
import { TopBar } from "@/components/molecules/top-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quantcase - AI-Powered Market Research",
  description: "Quantcase - the AI-powered market research used by industry professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppSidebar />
        <TopBar />
        {/* Main content offset for fixed sidebar (w-56) and top bar (h-14) */}
        <div className="ml-56 pt-14 min-h-screen bg-gray-50 dark:bg-black">
          {children}
        </div>
      </body>
    </html>
  );
}
