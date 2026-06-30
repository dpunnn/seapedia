'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ reviewerName: '', comment: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = () => {
    api.get('/reviews').then(res => {
      setReviews(res.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast.success('Ulasan berhasil dikirim!');
      setForm({ reviewerName: '', comment: '', rating: 5 });
      fetchReviews();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengirim ulasan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Ulasan Pengguna</h1>

      {user && (
        <Card className="mb-8">
          <CardContent className="p-5">
            <h2 className="font-semibold mb-4">Tulis Ulasan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label>Nama</Label>
                <Input
                  placeholder="Nama Anda"
                  value={form.reviewerName}
                  onChange={e => setForm(f => ({ ...f, reviewerName: e.target.value }))}
                  required maxLength={100}
                />
              </div>
              <div className="space-y-1">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n} type="button"
                      onClick={() => setForm(f => ({ ...f, rating: n }))}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                    >★</button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Komentar</Label>
                <Input
                  placeholder="Bagikan pengalaman Anda..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  required maxLength={500}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada ulasan. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{r.reviewerName}</p>
                  <div className="flex gap-0.5">
                    {Array(5).fill(0).map((_, i) => (
                      <span key={i} className={i < r.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
