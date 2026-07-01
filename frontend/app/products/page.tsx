'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatRupiah } from '@/lib/auth';
import api from '@/lib/api';
import {
  Package,
  Zap,
  Shirt,
  ShieldCheck,
  BookOpen,
  Home,
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  { label: 'Semua', value: '', icon: null },
  { label: 'Elektronik', value: 'Elektronik', icon: Zap },
  { label: 'Fashion', value: 'Fashion', icon: Shirt },
  { label: 'Kesehatan', value: 'Kesehatan', icon: ShieldCheck },
  { label: 'Buku', value: 'Buku', icon: BookOpen },
  { label: 'Rumah', value: 'Rumah', icon: Home },
];

const SORT_OPTIONS = [
  { label: 'Paling Relevan', value: '' },
  { label: 'Harga Terendah', value: 'price_asc' },
  { label: 'Harga Tertinggi', value: 'price_desc' },
  { label: 'Rating Tertinggi', value: 'rating_desc' },
  { label: 'Paling Laris', value: 'sold_desc' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#F59E0B', fontSize: 12 }}>
      {'★'.repeat(Math.round(rating || 0))}{'☆'.repeat(5 - Math.round(rating || 0))}
    </span>
  );
}

function ProductCard({ p }: { p: any }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  return (
    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: hovered
            ? '0 16px 40px rgba(0,0,0,.12)'
            : '0 2px 12px rgba(0,0,0,.06)',
          transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
          transition: 'all 0.22s ease',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image */}
        <div
          style={{
            aspectRatio: '1 / 1',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Package size={72} color="#CBD5E1" />
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {/* Store name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Store size={11} color="#94A3B8" />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>
              {p.store?.name || 'Toko'}
            </span>
          </div>

          {/* Product name */}
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0F172A',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            {p.name}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={p.rating || 4} />
            {p.sold != null && (
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{p.sold} terjual</span>
            )}
          </div>

          {/* Price */}
          <p style={{ fontSize: 17, fontWeight: 900, color: '#2563EB', margin: 0 }}>
            {formatRupiah(p.price)}
          </p>

          {/* Add cart button */}
          <button
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            onClick={(e) => e.preventDefault()}
            style={{
              width: '100%',
              background: btnHovered ? '#2563EB' : '#EFF6FF',
              color: btnHovered ? 'white' : '#2563EB',
              border: 'none',
              borderRadius: 9,
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              marginTop: 4,
            }}
          >
            + Keranjang
          </button>
        </div>
      </div>
    </Link>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState('');
  const [sort, setSort] = useState('');

  const LIMIT = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: {
          page,
          limit: LIMIT,
          ...(search && { search }),
          ...(activeCategory && { category: activeCategory }),
          ...(sort && { sort }),
        },
      });
      setProducts(res.data.data.products);
      setTotal(res.data.data.total);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeCategory, sort]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const totalPages = Math.ceil(total / LIMIT);

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px 0' }}>
        {/* Breadcrumb */}
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>
          <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Beranda</Link>
          {' / '}
          <span>Semua Produk</span>
        </p>

        {/* Title + Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0 }}>
            Jelajahi Semua Produk
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: 100,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <Package size={13} />
            {loading ? '...' : `${total} produk dari toko terpercaya`}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Category pills */}
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  borderRadius: 100,
                  border: `2px solid ${isActive ? '#2563EB' : '#E2E8F0'}`,
                  background: isActive ? '#2563EB' : 'white',
                  color: isActive ? 'white' : '#64748B',
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {Icon && <Icon size={13} />}
                {cat.label}
              </button>
            );
          })}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Sort select */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{
              padding: '9px 14px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: '#0F172A',
              background: 'white',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px 24px' }}>
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {Array(8).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  background: 'white',
                  borderRadius: 20,
                  aspectRatio: '3/4',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              gap: 16,
            }}
          >
            <Search size={64} color="#CBD5E1" />
            <p style={{ fontSize: 16, color: '#64748B', fontWeight: 600, margin: 0 }}>
              Produk tidak ditemukan
            </p>
            <p style={{ fontSize: 13, color: '#94A3B8', margin: 0 }}>
              Coba kata kunci atau kategori lain
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              marginTop: 40,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 14px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 10,
                background: 'white',
                color: page === 1 ? '#CBD5E1' : '#64748B',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <ChevronLeft size={14} /> Sebelumnya
            </button>

            {getPageNumbers().map((pg, idx) =>
              pg === '...' ? (
                <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>
              ) : (
                <button
                  key={pg}
                  onClick={() => setPage(pg as number)}
                  style={{
                    width: 36,
                    height: 36,
                    border: '1.5px solid',
                    borderColor: page === pg ? '#2563EB' : '#E2E8F0',
                    borderRadius: 9,
                    background: page === pg ? '#2563EB' : 'white',
                    color: page === pg ? 'white' : '#64748B',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {pg}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '8px 14px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 10,
                background: 'white',
                color: page === totalPages ? '#CBD5E1' : '#64748B',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Berikutnya <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#94A3B8' }}>Memuat produk...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
