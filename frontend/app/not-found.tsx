'use client';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        background: '#F0F5FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <SearchX style={{ width: 64, height: 64, color: '#CBD5E1' }} />
        </div>

        {/* 404 number */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1,
            marginBottom: 20,
            background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#0F172A',
            marginBottom: 12,
          }}
        >
          Halaman Tidak Ditemukan
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 14,
            color: '#64748B',
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Sepertinya halaman yang kamu cari sudah pindah atau tidak ada.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Kembali ke Beranda
          </Link>
          <Link
            href="/products"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              fontSize: 14,
              fontWeight: 700,
              borderRadius: 12,
              border: '1.5px solid #3B82F6',
              color: '#3B82F6',
              background: '#fff',
              textDecoration: 'none',
            }}
          >
            Lihat Produk
          </Link>
        </div>
      </div>
    </div>
  );
}
