import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "StudyVerse",
  description:
    "StudyVerse connects students by university, department, and semester to share knowledge and study together in real time.",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} bg-gray-50`}>
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
