import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AuthInit from "@/components/AuthInit";
import { Toaster } from "@/components/ui/sonner";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SEAPEDIA - Marketplace Terpercaya",
  description: "Platform belanja online dengan ribuan produk terbaik",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${font.className} min-h-screen`}>
        <AuthInit>
          <Navbar />
          <main style={{ paddingTop: 64 }}>{children}</main>
          <Toaster richColors position="top-right" />
        </AuthInit>
      </body>
    </html>
  );
}
