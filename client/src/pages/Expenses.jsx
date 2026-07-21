import { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import { getExpensesByFarm, createExpense, deleteExpense } from '../services/expenseService';
import { useAuth } from '../context/AuthContext';

const emptyForm = { category: 'fuel', description: '', amount: '', date: '' };

const CATEGORY_LABELS = {
  fuel: 'Fuel',
  labour: 'Labour',
  fertilizer: 'Fertilizer',
  seeds: 'Seeds',
  equipment: 'Equipment',
  other: 'Other',
};

function Expenses() {
  const { activeFarm } = useFarm();
  const { user } = useAuth();
  const canDelete = user?.role === 'owner' || user?.role === 'admin';
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  

  useEffect(() => {
    if (!activeFarm) return;
    loadExpenses();
  }, [activeFarm]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const data = await getExpensesByFarm(activeFarm._id);
      setExpenses(data);
    } catch (err) {
      console.error('Failed to load expenses:', err.message);
    } finally {
      setLoading(false);
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
      const created = await createExpense({ ...form, farm: activeFarm._id });
      setExpenses([created, ...expenses]);
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expense) => {
    if (!confirm(`Delete this ${expense.category} expense? This cannot be undone.`)) return;
    try {
      await deleteExpense(expense._id);
      setExpenses(expenses.filter((e) => e._id !== expense._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense.');
    }
    {canDelete && (
  <button onClick={() => handleDelete(expense)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition ml-auto">
    <Trash2 size={14} className="text-red-500" />
  </button>
)}
  };

  if (!activeFarm) {
    return (
      <Layout title="Expenses">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Layout title="Expenses">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Expenses</h2>
          <p className="text-sm text-neutral-500 mt-1">
            {expenses.length} expenses · ₦{totalExpenses.toLocaleString()} total spent
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center max-w-md mx-auto mt-16">
          <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No expenses yet</h3>
          <p className="text-sm text-neutral-500 mb-6">Add your first expense to start tracking spending.</p>
          <button
            onClick={openCreateModal}
            className="text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                  <td className="px-5 py-4 font-semibold text-neutral-900 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef2f2' }}>
                      <Receipt size={15} className="text-red-600" />
                    </div>
                    {CATEGORY_LABELS[expense.category]}
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{expense.description || '—'}</td>
                  <td className="px-5 py-4 font-semibold text-neutral-900">₦{expense.amount.toLocaleString()}</td>
                  <td className="px-5 py-4 text-neutral-500">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDelete(expense)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition ml-auto">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal title="Add Expense" isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-white"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Description</label>
            <input
              type="text" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Diesel refill"
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
                placeholder="45000"
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
            {saving ? 'Saving...' : 'Add Expense'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

export default Expenses;