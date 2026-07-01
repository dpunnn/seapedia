'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import {
  Package,
  Store,
  ShoppingCart,
  Zap,
  Star,
  Minus,
  Plus,
} from 'lucide-react';

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.round(rating || 0);
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {Array(5).fill(0).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < full ? '#F59E0B' : 'none'}
          color={i < full ? '#F59E0B' : '#CBD5E1'}
        />
      ))}
    </span>
  );
}

function RelatedCard({ p }: { p: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/products/${p.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: hovered ? '0 12px 32px rgba(0,0,0,.10)' : '0 2px 10px rgba(0,0,0,.06)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
      >
        <div style={{ aspectRatio: '1/1', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.imageUrl
            ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Package size={48} color="#CBD5E1" />}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {p.name}
          </p>
          <p style={{ fontSize: 14, fontWeight: 900, color: '#2563EB', margin: 0 }}>{formatRupiah(p.price)}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [storeHovered, setStoreHovered] = useState(false);
  const [cartBtnHovered, setCartBtnHovered] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(async (res) => {
        const prod = res.data.data.product ?? res.data.data;
        setProduct(prod);
        // fetch related
        try {
          const rel = await api.get('/products', { params: { limit: 4, category: prod.category } });
          setRelatedProducts((rel.data.data.products || []).filter((p: any) => p.id !== prod.id).slice(0, 4));
        } catch {}
      })
      .catch(() => {
        toast.error('Produk tidak ditemukan');
        router.push('/products');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!user) { router.push('/login'); return; }
    if (user.activeRole !== 'BUYER') {
      toast.error('Pilih peran Pembeli untuk menambahkan ke keranjang');
      return;
    }
    setAdding(true);
    try {
      await api.post('/buyer/cart/items', { productId: id, quantity });
      toast.success('Produk ditambahkan ke keranjang!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '100vh', maxWidth: 1200, margin: '0 auto', padding: '24px 32px 64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 40 }}>
          <div style={{ aspectRatio: '1/1', background: '#E2E8F0', borderRadius: 24, animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 20, width: '40%', background: '#E2E8F0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 32, width: '70%', background: '#E2E8F0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            <div style={{ height: 40, width: '50%', background: '#E2E8F0', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    );
  }

  if (!product) return null;

  const storeData = product.store || {};

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* Breadcrumb */}
        <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>
          <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Beranda</Link>
          {' / '}
          <Link href="/products" style={{ color: '#94A3B8', textDecoration: 'none' }}>Semua Produk</Link>
          {' / '}
          <span style={{ color: '#64748B' }}>{product.name}</span>
        </p>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: 40, alignItems: 'start' }}>

          {/* Left: Image */}
          <div
            style={{
              aspectRatio: '1/1',
              background: '#F1F5F9',
              borderRadius: 24,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package size={120} color="#CBD5E1" />}
          </div>

          {/* Right: Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Category badge */}
            {product.category && (
              <span
                style={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  background: '#F1F5F9',
                  color: '#64748B',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 100,
                  padding: '4px 12px',
                }}
              >
                {product.category}
              </span>
            )}

            {/* Title */}
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <StarRating rating={product.rating || 4} size={16} />
              <span style={{ fontSize: 13, color: '#94A3B8' }}>
                {product.rating ? `${product.rating.toFixed(1)} · ` : ''}{product.sold ?? 0} terjual
              </span>
            </div>

            {/* Price */}
            <p style={{ fontSize: 34, fontWeight: 900, color: '#2563EB', margin: 0 }}>
              {formatRupiah(product.price)}
            </p>

            {/* Store card */}
            <Link href={`/stores/${storeData.id}`} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={() => setStoreHovered(true)}
                onMouseLeave={() => setStoreHovered(false)}
                style={{
                  background: 'white',
                  border: `1.5px solid ${storeHovered ? '#BFDBFE' : '#F1F5F9'}`,
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: storeHovered ? '0 4px 16px rgba(37,99,235,.08)' : 'none',
                  transition: 'all 0.18s ease',
                  cursor: 'pointer',
                }}
              >
                {/* Store logo */}
                <div
                  style={{
                    width: 50,
                    height: 50,
                    background: '#EFF6FF',
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Store size={22} color="#2563EB" />
                </div>

                {/* Store info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>
                    {storeData.name || 'Toko'}
                  </p>
                  <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>
                    {storeData.rating ? `★ ${storeData.rating.toFixed(1)}` : '★ 4.8'} · {storeData.followers ?? 0} pengikut
                  </p>
                </div>

                <span style={{ fontSize: 13, color: '#2563EB', fontWeight: 700, flexShrink: 0 }}>
                  Kunjungi Toko →
                </span>
              </div>
            </Link>

            {/* Qty + Buttons */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Qty controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>Jumlah</span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{
                        width: 36,
                        height: 36,
                        background: '#F1F5F9',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                      }}
                    >
                      <Minus size={14} color="#64748B" />
                    </button>
                    <span style={{ padding: '0 18px', fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      style={{
                        width: 36,
                        height: 36,
                        background: '#F1F5F9',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                      }}
                    >
                      <Plus size={14} color="#64748B" />
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>Stok: {product.stock}</span>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onMouseEnter={() => setCartBtnHovered(true)}
                    onMouseLeave={() => setCartBtnHovered(false)}
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: cartBtnHovered ? '#DBEAFE' : '#EFF6FF',
                      color: '#2563EB',
                      border: 'none',
                      borderRadius: 14,
                      padding: '14px 0',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: adding ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s ease',
                      opacity: adding ? 0.7 : 1,
                    }}
                  >
                    <ShoppingCart size={16} />
                    {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 14,
                      padding: '14px 0',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: adding ? 'not-allowed' : 'pointer',
                      opacity: adding ? 0.7 : 1,
                    }}
                  >
                    <Zap size={16} />
                    Beli Sekarang
                  </button>
                </div>
              </div>
            )}

            {product.stock === 0 && (
              <div style={{ padding: '14px 18px', background: '#FEF2F2', borderRadius: 12, color: '#EF4444', fontWeight: 600, fontSize: 14 }}>
                Produk ini sedang tidak tersedia (stok habis)
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div style={{ borderTop: '1.5px solid #F1F5F9', paddingTop: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>Deskripsi Produk</p>
                <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Store info card */}
        <div
          style={{
            background: 'white',
            border: '1.5px solid #F1F5F9',
            borderRadius: 22,
            padding: 28,
            marginTop: 40,
            marginBottom: 40,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: '0 0 20px' }}>Informasi Toko</h3>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {[
              { label: 'Rating Toko', value: storeData.rating ? `★ ${storeData.rating.toFixed(1)}` : '★ 4.8' },
              { label: 'Pengikut', value: storeData.followers ?? 0 },
              { label: 'Total Produk', value: storeData.productCount ?? product.store?.productCount ?? '-' },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#2563EB', margin: '0 0 4px' }}>{stat.value}</p>
                <p style={{ fontSize: 12, color: '#94A3B8', margin: 0, fontWeight: 600 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 18px' }}>Produk Serupa</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 18,
              }}
            >
              {relatedProducts.map((p) => (
                <RelatedCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}
