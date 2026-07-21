import { useState, useEffect } from 'react';
import { Boxes, Sprout, FlaskConical, Wrench, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';
import {
  getInventoryByFarm, createInventoryItem, updateInventoryItem, deleteInventoryItem,
} from '../services/inventoryService';

const emptyForm = {
  category: 'seeds', itemName: '', quantity: '', unit: '', unitCost: '', minThreshold: '',
};

const CATEGORY_META = {
  seeds: { label: 'Seeds', icon: Sprout },
  fertilizer: { label: 'Fertilizer', icon: Boxes },
  chemicals: { label: 'Chemicals', icon: FlaskConical },
  equipment: { label: 'Equipment', icon: Wrench },
};

const isCritical = (item) => item.quantity <= item.minThreshold / 2;

function Inventory() {
  const { activeFarm } = useFarm();
  const { user } = useAuth();
  const canDelete = user?.role === 'owner' || user?.role === 'admin';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeFarm) return;
    loadItems();
  }, [activeFarm]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await getInventoryByFarm(activeFarm._id);
      setItems(data);
    } catch (err) {
      console.error('Failed to load inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category,
      itemName: item.itemName,
      quantity: item.quantity,
      unit: item.unit || '',
      unitCost: item.unitCost || '',
      minThreshold: item.minThreshold,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingItem) {
        const updated = await updateInventoryItem(editingItem._id, form);
        setItems(items.map((i) => (i._id === updated._id ? updated : i)));
      } else {
        const created = await createInventoryItem({ ...form, farm: activeFarm._id });
        setItems([created, ...items]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.itemName}"? This cannot be undone.`)) return;
    try {
      await deleteInventoryItem(item._id);
      setItems(items.filter((i) => i._id !== item._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  if (!activeFarm) {
    return (
      <Layout title="Inventory">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const stockValue = items.reduce((sum, i) => sum + (i.totalValue || 0), 0);
  const lowStockCount = items.filter((i) => i.isLowStock && !isCritical(i)).length;
  const criticalCount = items.filter((i) => isCritical(i)).length;

  const categoryCounts = Object.keys(CATEGORY_META).reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat).length;
    return acc;
  }, {});

  return (
    <Layout title="Inventory">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Inventory</h2>
          <p className="text-sm text-neutral-500 mt-1">
            {items.length} items across {Object.values(categoryCounts).filter((c) => c > 0).length} categories
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Quantity</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <Boxes size={16} style={{ color: '#15803d' }} />
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-neutral-900">{totalItems.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Stock Value</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
              <Boxes size={16} style={{ color: '#15803d' }} />
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-neutral-900">₦{stockValue.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Low Stock</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-amber-600">{lowStockCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Critical</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
          </div>
          <p className="font-display font-extrabold text-2xl text-red-600">{criticalCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(CATEGORY_META).map(([key, { label, icon: Icon }]) => (
          <div key={key} className="bg-white rounded-2xl border border-neutral-200 p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: '#f0fdf4' }}>
              <Icon size={17} style={{ color: '#15803d' }} />
            </div>
            <p className="font-display font-bold text-neutral-900">{label}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{categoryCounts[key]} items</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="font-display font-bold text-neutral-900">Current Stock</h3>
        </div>

        {loading ? (
          <p className="text-neutral-500 p-5">Loading inventory...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No inventory yet</h3>
            <p className="text-sm text-neutral-500 mb-6">Add your first item to start tracking stock.</p>
            <button
              onClick={openCreateModal}
              className="text-white font-semibold px-5 py-2.5 rounded-xl"
              style={{ backgroundColor: '#15803d' }}
            >
              Add Item
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Item</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Quantity</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Min Stock</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Updated</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const critical = isCritical(item);
                  return (
                    <tr key={item._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                      <td className="px-5 py-4 font-semibold text-neutral-900">{item.itemName}</td>
                      <td className="px-5 py-4 text-neutral-600">{CATEGORY_META[item.category]?.label}</td>
                      <td className="px-5 py-4 text-neutral-600">{item.quantity} {item.unit}</td>
                      <td className="px-5 py-4 text-neutral-600">{item.minThreshold} {item.unit}</td>
                      <td className="px-5 py-4">
                        {critical ? (
                          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700">Critical</span>
                        ) : item.isLowStock ? (
                          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700">Low</span>
                        ) : (
                          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                            Healthy
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-neutral-500">{new Date(item.updatedAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEditModal(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition">
                            <Pencil size={14} className="text-neutral-500" />
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(item)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition">
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        title={editingItem ? 'Edit Item' : 'Add Inventory Item'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
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
              {Object.entries(CATEGORY_META).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Item Name</label>
            <input
              type="text" required value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              placeholder="NPK Fertilizer"
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
                placeholder="5"
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Unit Cost (₦)</label>
              <input
                type="number" min="0" value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: e.target.value })}
                placeholder="8000"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Min Stock Threshold</label>
              <input
                type="number" min="0" value={form.minThreshold}
                onChange={(e) => setForm({ ...form, minThreshold: e.target.value })}
                placeholder="10"
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
            {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Item'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

export default Inventory;