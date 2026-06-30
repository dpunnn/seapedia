import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthInit from "@/components/AuthInit";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEAPEDIA - Marketplace Terpercaya",
  description: "Platform belanja online dengan ribuan produk terbaik",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen`}>
        <AuthInit>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)] bg-gray-50">{children}</main>
          <Toaster richColors position="top-right" />
        </AuthInit>
      </body>
    </html>
  );
}
