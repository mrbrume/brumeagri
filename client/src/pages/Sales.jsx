import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import { getSalesByFarm, createSale, deleteSale } from '../services/saleService';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  product: '', quantity: '', unit: '', customer: '', amount: '', date: '',
};

function Sales() {
  const { activeFarm } = useFarm();
  const { user } = useAuth();
  const canDelete = user?.role === 'owner' || user?.role === 'admin';
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeFarm) return;
    loadSales();
  }, [activeFarm]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const data = await getSalesByFarm(activeFarm._id, 1);
      setSales(data.sales);
      setPage(1);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Failed to load sales:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await getSalesByFarm(activeFarm._id, nextPage);
      setSales([...sales, ...data.sales]);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more sales:', err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const openCreateModal = () => {
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await createSale({ ...form, farm: activeFarm._id });
      setSales([created, ...sales]);
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sale) => {
    if (!confirm(`Delete this sale of ${sale.product}? This cannot be undone.`)) return;
    try {
      await deleteSale(sale._id);
      setSales(sales.filter((s) => s._id !== sale._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete sale.');
    }
  };

  if (!activeFarm) {
    return (
      <Layout title="Sales">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.amount, 0);

  return (
    <Layout title="Sales">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Sales</h2>
          <p className="text-sm text-neutral-500 mt-1">
            {sales.length} sales · ₦{totalRevenue.toLocaleString()} total revenue
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> Record Sale
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading sales...</p>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center max-w-md mx-auto mt-16">
          <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No sales yet</h3>
          <p className="text-sm text-neutral-500 mb-6">Record your first sale to start tracking revenue.</p>
          <button
            onClick={openCreateModal}
            className="text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Record Sale
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Quantity</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Customer</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                    <td className="px-5 py-4 font-semibold text-neutral-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4' }}>
                        <ShoppingCart size={15} style={{ color: '#15803d' }} />
                      </div>
                      {sale.product}
                    </td>
                    <td className="px-5 py-4 text-neutral-600">{sale.quantity} {sale.unit}</td>
                    <td className="px-5 py-4 text-neutral-600">{sale.customer}</td>
                    <td className="px-5 py-4 font-semibold text-neutral-900">₦{sale.amount.toLocaleString()}</td>
                    <td className="px-5 py-4 text-neutral-500">{new Date(sale.date).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      {canDelete && (
                        <button onClick={() => handleDelete(sale)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition ml-auto">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {page < totalPages && (
            <div className="p-4 text-center border-t border-neutral-100">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-sm font-semibold px-5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition disabled:opacity-60"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}

      <Modal title="Record Sale" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Product</label>
            <input
              type="text" required value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              placeholder="Maize"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Quantity</label>
              <input
                type="number" required min="0" value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="50"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Unit</label>
              <input
                type="text" value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="bags"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Customer</label>
            <input
              type="text" required value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="ABC Traders"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Amount (₦)</label>
              <input
                type="number" required min="0" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="250000"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Date</label>
              <input
                type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            style={{ backgroundColor: '#15803d' }}
          >
            {saving ? 'Saving...' : 'Record Sale'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

export default Sales;