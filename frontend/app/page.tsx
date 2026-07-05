'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ShoppingBag, ShoppingCart, Package, Store, Users, ShieldCheck,
  Zap, BookOpen, Home, Lock, RotateCcw, MessageCircle, Globe,
  Share2, AtSign, Tag, Shirt,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/auth';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

/* ── countdown ── */
function useCountdown() {
  const [s, setS] = useState('10:55:00');
  useEffect(() => {
    const end = new Date(); end.setHours(23, 59, 59, 0);
    const t = setInterval(() => {
      const d = Math.max(0, end.getTime() - Date.now());
      const h = String(Math.floor(d / 3600000)).padStart(2, '0');
      const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
      const sc = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
      setS(`${h}:${m}:${sc}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return s;
}

const BRANDS = ['Samsung', 'Apple', 'ASUS', 'Nike', 'Adidas', 'Sony', 'Xiaomi', 'Oppo', 'Vivo', 'Lenovo', 'HP', 'Batik Keris'];

const CATS = [
  { id: 'elektronik', label: 'Elektronik',   icon: Zap,      color: '#1D4ED8', bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', hoverShadow: 'rgba(37,99,235,.18)'  },
  { id: 'fashion',   label: 'Fashion',       icon: Shirt,    color: '#7C3AED', bg: 'linear-gradient(135deg,#FDF4FF,#EDE9FE)', hoverShadow: 'rgba(124,58,237,.18)' },
  { id: 'kesehatan', label: 'Kesehatan',     icon: ShieldCheck,color:'#059669', bg: 'linear-gradient(135deg,#F0FDF4,#DCFCE7)', hoverShadow: 'rgba(5,150,105,.18)'  },
  { id: 'buku',      label: 'Buku',          icon: BookOpen, color: '#EA580C', bg: 'linear-gradient(135deg,#FFF7ED,#FED7AA)', hoverShadow: 'rgba(234,88,12,.18)'  },
  { id: 'rumah',     label: 'Rumah & Dapur', icon: Home,     color: '#DC2626', bg: 'linear-gradient(135deg,#FFF1F2,#FFE4E6)', hoverShadow: 'rgba(220,38,38,.18)'  },
];

const TRUST = [
  { icon: Zap,          title: 'Pengiriman Cepat', desc: 'Express 2 jam untuk area tertentu, gratis ongkir min. Rp 100.000', bg: '#EFF6FF', hoverBorder: '#BFDBFE', hoverShadow: 'rgba(37,99,235,.08)'  },
  { icon: Lock,         title: 'Bayar Aman',       desc: 'Dana terlindungi hingga pesanan terkonfirmasi diterima pembeli.',   bg: '#F0FDF4', hoverBorder: '#BBF7D0', hoverShadow: 'rgba(5,150,105,.08)'  },
  { icon: RotateCcw,    title: 'Garansi Return',   desc: 'Return mudah 7 hari, refund otomatis ke dompet SEAPEDIA.',         bg: '#FFF7ED', hoverBorder: '#FED7AA', hoverShadow: 'rgba(234,88,12,.08)'  },
  { icon: MessageCircle,title: 'Support 24/7',     desc: 'Tim CS siap membantu kapan saja via chat, email, atau telepon.',   bg: '#F5F3FF', hoverBorder: '#E9D5FF', hoverShadow: 'rgba(124,58,237,.08)' },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const countdown  = useCountdown();
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [adding, setAdding]     = useState<string | null>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [form, setForm] = useState({ reviewerName: '', comment: '', rating: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/products?limit=8'), api.get('/reviews')])
      .then(([p, r]) => { setProducts(p.data.data.products); setReviews(r.data.data.slice(0, 3)); })
      .finally(() => setLoading(false));
  }, []);

  const handleCart = async (p: any) => {
    if (!user || user.activeRole !== 'BUYER') { toast.error('Login sebagai Pembeli untuk menambahkan ke keranjang'); return; }
    setAdding(p.id);
    try { await api.post('/buyer/cart/items', { productId: p.id, quantity: 1 }); toast.success('Ditambahkan ke keranjang'); }
    catch (e: any) { toast.error(e.response?.data?.message || 'Gagal'); }
    finally { setAdding(null); }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Pilih rating bintang'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast.success('Ulasan berhasil dikirim!');
      setForm({ reviewerName: '', comment: '', rating: 0 });
      const r = await api.get('/reviews');
      setReviews(r.data.data.slice(0, 3));
    } catch (e: any) { toast.error(e.response?.data?.message || 'Gagal'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#F8FAFC' }}>

      {/* ── HERO ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-[120px] lg:pb-[88px]" style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 45%,#2563EB 75%,#3B82F6 100%)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', top: -80, right: 140, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -140, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />

        <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1200, margin: '0 auto', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>

          {/* Left */}
          <div style={{ flex: 1, maxWidth: 580, width: '100%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 100, padding: '7px 16px', marginBottom: 28, backdropFilter: 'blur(8px)', flexWrap: 'wrap' }}>
              <Zap style={{ width: 14, height: 14, color: 'white', fill: 'white' }} />
              <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Flash Sale Aktif!</span>
              <span style={{ background: '#F59E0B', color: 'white', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '.5px', fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px]" style={{ fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.08 }}>
              Belanja Lebih<br />
              <span style={{ color: '#FCD34D' }}>Mudah &amp; Hemat</span><br />
              di SEAPEDIA
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.85)', margin: '0 0 36px', lineHeight: 1.7, maxWidth: 480 }}>
              Ribuan produk dari penjual terpercaya. Pengiriman cepat, harga bersaing, dan transaksi 100% aman terjamin.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/products" style={{ padding: '15px 30px', background: 'white', color: '#1D4ED8', fontSize: 15, fontWeight: 800, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,.2)' }}>
                <ShoppingCart style={{ width: 18, height: 18 }} /> Belanja Sekarang
              </Link>
              <Link href="/register" style={{ padding: '15px 30px', background: 'rgba(255,255,255,.12)', color: 'white', fontSize: 15, fontWeight: 700, borderRadius: 12, border: '2px solid rgba(255,255,255,.35)', backdropFilter: 'blur(4px)', display: 'inline-flex', alignItems: 'center' }}>
                Daftar Gratis →
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>✅ Gratis ongkir</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>🔒 Bayar aman</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>↩️ Garansi return</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.8)' }}>⭐ Rating 4.9/5</span>
            </div>
          </div>

          {/* Right — CSS mascot */}
          <div className="hidden lg:flex" style={{ flexShrink: 0, width: 400, height: 460, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.14),transparent 70%)', pointerEvents: 'none' }} />

            {/* Mascot */}
            <div style={{ position: 'relative', width: 300, height: 360, zIndex: 2, animation: 'charFloat 4s ease-in-out infinite' }}>
              {/* shadow */}
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 170, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,.28)', filter: 'blur(6px)' }} />
              {/* left arm */}
              <div style={{ position: 'absolute', top: 118, left: 22, width: 34, height: 78, borderRadius: 17, background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', transform: 'rotate(-35deg)', boxShadow: 'inset -4px -4px 8px rgba(0,0,0,.12),inset 4px 4px 8px rgba(255,255,255,.35)', zIndex: 1 }} />
              {/* right arm */}
              <div style={{ position: 'absolute', top: 150, right: 24, width: 32, height: 70, borderRadius: 16, background: 'linear-gradient(135deg,#FCD34D,#F59E0B)', transform: 'rotate(28deg)', boxShadow: 'inset -4px -4px 8px rgba(0,0,0,.12),inset 4px 4px 8px rgba(255,255,255,.35)', zIndex: 1 }} />
              {/* legs */}
              <div style={{ position: 'absolute', bottom: 26, left: 96, width: 34, height: 46, borderRadius: 14, background: 'linear-gradient(160deg,#1E3A8A,#1D4ED8)' }} />
              <div style={{ position: 'absolute', bottom: 26, right: 96, width: 34, height: 46, borderRadius: 14, background: 'linear-gradient(160deg,#1E3A8A,#1D4ED8)' }} />
              {/* shoes */}
              <div style={{ position: 'absolute', bottom: 14, left: 88, width: 48, height: 22, borderRadius: 12, background: '#0F172A' }} />
              <div style={{ position: 'absolute', bottom: 14, right: 88, width: 48, height: 22, borderRadius: 12, background: '#0F172A' }} />
              {/* body */}
              <div style={{ position: 'absolute', top: 96, left: '50%', transform: 'translateX(-50%)', width: 190, height: 170, borderRadius: 32, background: 'linear-gradient(155deg,#FDE68A 0%,#FBBF24 45%,#EA8C0E 100%)', boxShadow: '0 24px 48px rgba(180,83,9,.35),inset 0 4px 12px rgba(255,255,255,.4)', zIndex: 2 }}>
                {/* gloss */}
                <div style={{ position: 'absolute', top: 14, left: 20, width: 70, height: 36, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(255,255,255,.55),transparent 70%)' }} />
                {/* tape */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 26, height: '100%', background: 'linear-gradient(90deg,rgba(255,255,255,.35),rgba(255,255,255,.15))' }} />
                {/* eyes */}
                <div style={{ position: 'absolute', top: 56, left: 44, width: 26, height: 30, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,.15)' }}>
                  <div style={{ position: 'absolute', top: 9, left: 8, width: 11, height: 11, borderRadius: '50%', background: '#0F172A' }} />
                </div>
                <div style={{ position: 'absolute', top: 56, right: 44, width: 26, height: 30, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,.15)' }}>
                  <div style={{ position: 'absolute', top: 9, left: 8, width: 11, height: 11, borderRadius: '50%', background: '#0F172A' }} />
                </div>
                {/* cheeks */}
                <div style={{ position: 'absolute', top: 92, left: 30, width: 20, height: 12, borderRadius: '50%', background: 'rgba(239,68,68,.35)' }} />
                <div style={{ position: 'absolute', top: 92, right: 30, width: 20, height: 12, borderRadius: '50%', background: 'rgba(239,68,68,.35)' }} />
                {/* smile */}
                <div style={{ position: 'absolute', top: 96, left: '50%', transform: 'translateX(-50%)', width: 44, height: 22, border: '4px solid #0F172A', borderTop: 'none', borderRadius: '0 0 44px 44px' }} />
              </div>
              {/* shopping bag in right hand */}
              <div style={{ position: 'absolute', top: 198, right: 6, width: 46, height: 52, borderRadius: 8, background: 'linear-gradient(160deg,#3B82F6,#1D4ED8)', boxShadow: '0 8px 16px rgba(29,78,216,.4)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShoppingBag style={{ width: 22, height: 22, color: 'white' }} />
              </div>
            </div>

            {/* Notif card */}
            <div style={{ position: 'absolute', bottom: 36, right: -10, background: 'white', borderRadius: 14, padding: '12px 16px', width: 210, boxShadow: '0 10px 32px rgba(0,0,0,.18)', animation: 'float3 5s ease-in-out 1.5s infinite', display: 'flex', alignItems: 'center', gap: 10, zIndex: 3 }}>
              <div style={{ width: 36, height: 36, background: '#F0FDF4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShoppingBag style={{ width: 18, height: 18, color: '#16A34A' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748B' }}>Pesanan Selesai!</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>+Rp 1.250.000</div>
              </div>
            </div>

            {/* Live badge */}
            <div style={{ position: 'absolute', top: 24, left: -16, background: 'rgba(255,255,255,.96)', borderRadius: 12, padding: '9px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.15)', display: 'flex', alignItems: 'center', gap: 8, animation: 'float2 4.5s ease-in-out 2s infinite', zIndex: 3 }}>
              <div style={{ width: 8, height: 8, background: '#16A34A', borderRadius: '50%', animation: 'pulseDot 1.5s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>1.247 orang online</span>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 80" style={{ display: 'block', width: '100%', height: 80 }} preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="#F8FAFC" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: 'white', borderBottom: '1px solid #F1F5F9' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {[
            { icon: Package,     value: '10.000+', label: 'Produk Tersedia', bg: '#EFF6FF' },
            { icon: Store,       value: '2.000+',  label: 'Penjual Aktif',   bg: '#F5F3FF' },
            { icon: Users,       value: '50.000+', label: 'Pembeli Puas',    bg: '#FFFBEB' },
            { icon: ShieldCheck, value: '99.9%',   label: 'Transaksi Aman',  bg: '#F0FDF4' },
          ].map(({ icon: Icon, value, label, bg }) => (
            <div key={label} style={{
              padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12,
              border: '1px solid #F1F5F9',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 26, height: 26, color: '#2563EB' }} />
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRAND TICKER ── */}
      <div style={{ background: '#1D4ED8', padding: '10px 0', overflow: 'hidden' }}>
        <div className="animate-marquee">
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} style={{ padding: '0 28px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.7)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Tag style={{ width: 12, height: 12, color: '#FCD34D' }} /> {b}
            </span>
          ))}
        </div>
      </div>

      {/* ── KATEGORI ── */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ padding: '48px 0 32px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#0F172A', margin: 0 }}>Jelajahi Kategori</h2>
            <Link href="/products" style={{ fontSize: 14, color: '#2563EB', fontWeight: 600 }}>Lihat semua →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {CATS.map(({ id, label, icon: Icon, color, bg }) => (
              <Link key={id} href={`/products?search=${id}`}
                style={{ background: bg, borderRadius: 20, padding: '28px 16px', textAlign: 'center', cursor: 'pointer', border: '1.5px solid transparent', transition: 'all .3s', display: 'block' }}>
                <div style={{ width: 52, height: 52, background: 'white', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                  <Icon style={{ width: 26, height: 26, color }} />
                </div>
                <div style={{ fontWeight: 800, fontSize: 15, color }}>{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLASH SALE ── */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ padding: '0 0 48px', background: '#F8FAFC' }}>
        <div className="px-4 sm:px-6" style={{ maxWidth: 1200, margin: '0 auto', background: 'linear-gradient(135deg,#EA580C 0%,#DC2626 55%,#9F1239 100%)', borderRadius: 24, padding: '28px 0', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div className="flex-col sm:flex-row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, position: 'relative', gap: 16 }}>
            <div className="flex-wrap" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <div style={{ color: 'white', fontSize: 24, fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap style={{ width: 22, height: 22, fill: 'white' }} /> FLASH SALE
                </div>
                <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12, marginTop: 2, fontWeight: 500 }}>Penawaran terbatas! Berakhir dalam:</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,.25)', borderRadius: 12, padding: '10px 18px' }}>
                <span style={{ color: 'white', fontSize: 22, fontWeight: 900, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>{countdown}</span>
              </div>
            </div>
            <Link href="/products" style={{ color: 'white', background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Lihat Semua →
            </Link>
          </div>
          {!loading && (
            <div className="grid-cols-2 lg:grid-cols-4" style={{ display: 'grid', gap: 12, position: 'relative' }}>
              {products.slice(0, 4).map((p, i) => (
                <Link key={p.id} href={`/products/${p.id}`} style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, padding: 16, display: 'block' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 62, height: 62, background: 'rgba(255,255,255,.9)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Package style={{ width: 28, height: 28, color: '#94A3B8' }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 13, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</div>
                      <div style={{ color: '#FCD34D', fontWeight: 800, fontSize: 16, marginTop: 4 }}>{formatRupiah(p.price)}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, background: 'rgba(0,0,0,.2)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ background: '#FCD34D', color: '#7C2D12', borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>-{10 + i * 5}%</span>
                    <span style={{ background: 'white', color: '#DC2626', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700 }}>Beli</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section id="products" className="px-4 sm:px-6 lg:px-8" style={{ padding: '0 0 64px', background: '#F8FAFC' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>✨ PILIHAN TERBAIK</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0F172A', margin: 0 }}>Produk Terbaru</h2>
            </div>
            <Link href="/products" style={{ fontSize: 14, color: '#2563EB', fontWeight: 600 }}>Lihat semua →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 20, height: 340, animation: 'shimmer 1.5s infinite', backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '400px 100%' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {products.map((p) => (
                <div key={p.id} style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', position: 'relative', transition: 'all .3s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 40px rgba(0,0,0,.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}
                >
                  <Link href={`/products/${p.id}`} style={{ position: 'relative', aspectRatio: '1', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', textDecoration: 'none' }}>
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package style={{ width: 78, height: 78, color: '#CBD5E1' }} />
                    }
                    <div style={{ position: 'absolute', top: 12, left: 12, background: 'linear-gradient(135deg,#1D4ED8,#3B82F6)', color: 'white', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 7, letterSpacing: '.5px' }}>TERLARIS</div>
                  </Link>
                  <button
                    onClick={() => setWishlist(s => { const n = new Set(s); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n; })}
                    style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.9)', border: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.12)', zIndex: 2 }}
                  >
                    {wishlist.has(p.id) ? '❤️' : '🤍'}
                  </button>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Store style={{ width: 11, height: 11 }} /> {p.store?.name}
                    </div>
                    <Link href={`/products/${p.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45, minHeight: 41 }}>{p.name}</div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
                      <span style={{ color: '#F59E0B', fontSize: 11, letterSpacing: 1 }}>★★★★★</span>
                      <span style={{ fontSize: 11, color: '#94A3B8' }}>4.9 · terjual</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#2563EB', marginBottom: 12 }}>{formatRupiah(p.price)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, color: p.stock <= 5 ? '#DC2626' : '#16A34A', background: p.stock <= 5 ? '#FEF2F2' : '#F0FDF4' }}>
                        Stok: {p.stock}
                      </div>
                      <button
                        onClick={() => handleCart(p)}
                        disabled={p.stock === 0 || adding === p.id}
                        style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: p.stock === 0 ? 0.5 : 1 }}
                      >
                        {adding === p.id ? '...' : p.stock === 0 ? 'Habis' : '+ Keranjang'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="px-4 sm:px-6 lg:px-8" style={{ padding: '0 0 64px', background: '#F8FAFC' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {TRUST.map(({ icon: Icon, title, desc, bg }) => (
            <div key={title} style={{ background: 'white', borderRadius: 18, padding: 24, border: '1.5px solid #F1F5F9', display: 'flex', alignItems: 'flex-start', gap: 16, transition: 'all .3s' }}>
              <div style={{ width: 48, height: 48, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 24, height: 24, color: '#2563EB' }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="px-4 sm:px-6 lg:px-8" style={{ background: 'white', padding: '64px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>💬 ULASAN PENGGUNA</div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px]" style={{ fontWeight: 900, color: '#0F172A', margin: '0 0 10px' }}>Apa Kata Mereka?</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ color: '#F59E0B', fontSize: 22 }}>★★★★★</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>4.9</span>
              <span style={{ fontSize: 14, color: '#64748B' }}>dari 50.000+ ulasan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6" style={{ marginBottom: 40 }}>
            {reviews.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: '#94A3B8' }}>Belum ada ulasan. Jadilah yang pertama!</div>
            ) : reviews.map((r, i) => {
              const colors = ['#2563EB', '#7C3AED', '#059669'];
              return (
                <div key={r.id} style={{ background: '#F8FAFC', borderRadius: 20, padding: 28, border: '1.5px solid #F1F5F9', transition: 'all .3s' }}>
                  <div style={{ fontSize: 44, color: '#DBEAFE', lineHeight: .8, fontWeight: 900, marginBottom: 14 }}>"</div>
                  <div style={{ color: '#F59E0B', fontSize: 14, letterSpacing: 2, marginBottom: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75, margin: '0 0 22px', fontStyle: 'italic' }}>{r.comment}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {r.reviewerName?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{r.reviewerName}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>Pembeli SEAPEDIA</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review Form */}
          <div style={{ background: 'linear-gradient(135deg,#F0F7FF,#F5F0FF)', borderRadius: 24, padding: '28px 20px', border: '1.5px solid #DBEAFE' }}>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>💌 Bagikan Pengalamanmu</h3>
            <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 28px' }}>Ulasanmu membantu jutaan pembeli membuat keputusan yang lebih baik!</p>
            <form onSubmit={handleReview} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 }}>Nama</label>
                  <input type="text" placeholder="Nama lengkapmu..." required value={form.reviewerName} onChange={e => setForm(f => ({ ...f, reviewerName: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Rating</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array(5).fill(0).map((_, i) => {
                      const n = i + 1, active = (hoverStar || form.rating) >= n;
                      return (
                        <button key={i} type="button"
                          onClick={() => setForm(f => ({ ...f, rating: n }))}
                          onMouseEnter={() => setHoverStar(n)}
                          onMouseLeave={() => setHoverStar(0)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 32, color: active ? '#F59E0B' : '#D1D5DB', padding: 0, lineHeight: 1 }}>★</button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 7 }}>Komentar</label>
                  <textarea placeholder="Ceritakan pengalamanmu berbelanja di SEAPEDIA..." required value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, resize: 'none', height: 112, outline: 'none', background: 'white', boxSizing: 'border-box' }} />
                </div>
                <button type="submit" disabled={submitting}
                  style={{ padding: '14px 24px', background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,.3)' }}>
                  {submitting ? 'Mengirim...' : '✨ Kirim Ulasan'}
                </button>
                <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center' }}>Ulasan ini soal pengalaman menggunakan SEAPEDIA — bisa dikirim tanpa checkout atau login.</div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── SELLER CTA ── */}
      <section id="seller" className="px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg,#1E3A8A 0%,#1D4ED8 50%,#2563EB 100%)', padding: '56px 0 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
        <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1200, margin: '0 auto', alignItems: 'center', justifyContent: 'space-between', gap: 40, position: 'relative' }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#93C5FD', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store style={{ width: 14, height: 14 }} /> UNTUK PENJUAL
            </div>
            <h2 className="text-3xl lg:text-[38px]" style={{ fontWeight: 900, color: 'white', margin: '0 0 16px', lineHeight: 1.15 }}>Mulai Berjualan<br />di SEAPEDIA, Gratis!</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.8)', margin: '0 0 32px', lineHeight: 1.75 }}>Bergabung dengan 2.000+ penjual sukses. Nikmati buka toko gratis, laporan real-time, dan jangkau lebih dari 50.000 pembeli aktif.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/register" style={{ padding: '15px 30px', background: 'white', color: '#1D4ED8', fontSize: 15, fontWeight: 800, borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,.15)' }}>
                <Store style={{ width: 18, height: 18 }} /> Daftar sebagai Penjual
              </Link>
              <Link href="/products" style={{ padding: '15px 24px', background: 'rgba(255,255,255,.1)', color: 'white', fontSize: 15, fontWeight: 600, borderRadius: 12, border: '2px solid rgba(255,255,255,.3)', display: 'inline-flex', alignItems: 'center' }}>
                Pelajari Lebih →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 w-full lg:w-auto" style={{ gap: 16, flexShrink: 0 }}>
            {[['2.000+','Seller Aktif'],['Rp 5M+','Total Transaksi'],['0%','Biaya Daftar'],['24/7','Support']].map(([v,l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.18)', borderRadius: 18, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: '#FCD34D', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 sm:px-6 lg:px-8" style={{ background: '#0F172A', padding: '56px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12" style={{ marginBottom: 52 }}>
            <div className="col-span-2 lg:col-span-1">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag style={{ width: 20, height: 20, color: 'white' }} />
                </div>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: -.5 }}>SEAPEDIA</span>
              </div>
              <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.8, margin: '0 0 22px', maxWidth: 280 }}>Marketplace terpercaya untuk semua. Ribuan produk dari seller pilihan, pengiriman cepat ke seluruh Indonesia.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[Globe, Share2, AtSign, MessageCircle].map((Icon, i) => (
                  <div key={i} style={{ width: 38, height: 38, background: '#1E293B', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon style={{ width: 17, height: 17, color: '#64748B' }} />
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'Navigasi', links: [['Beranda','/'],['Produk','/products'],['Ulasan','/reviews'],['Flash Sale','/products'],['Tentang Kami','/']] },
              { title: 'Akun', links: [['Masuk','/login'],['Daftar Akun','/register'],['Dashboard Buyer','/dashboard/buyer'],['Dashboard Seller','/dashboard/seller'],['Dashboard Driver','/dashboard/driver']] },
              { title: 'Bantuan', links: [['Pusat Bantuan','/'],['Kebijakan Privasi','/'],['Syarat & Ketentuan','/'],['Hubungi Kami','/'],['Blog SEAPEDIA','/']] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 18, textTransform: 'uppercase', letterSpacing: .5 }}>{title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {links.map(([label, href]) => (
                    <Link key={label} href={href} style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #1E293B', paddingTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 13, color: '#475569' }}>© 2026 SEAPEDIA — Marketplace Terpercaya untuk Semua 🇮🇩</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#475569' }}>Made with ❤️ in Indonesia</span>
              <div style={{ background: '#1E293B', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck style={{ width: 11, height: 11 }} /> SSL Secured
              </div>
              <div style={{ background: '#1E293B', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Lock style={{ width: 11, height: 11 }} /> PCI DSS
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
