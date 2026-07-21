import { useState, useEffect } from 'react';
import { Sprout, Plus, Pencil } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import { getAllCrops, createCrop, updateCrop } from '../services/cropService';

const emptyForm = {
  farm: '', name: '', plantingDate: '', expectedHarvestDate: '',
  expectedYield: '', actualYield: '', healthScore: 100, status: 'planted',
};

const getStatusBadge = (crop) => {
  if (crop.healthScore < 60) return { label: 'Warning', bg: '#fffbeb', text: '#d97706' };
  if (crop.status === 'growing') return { label: 'Growing', bg: '#eff6ff', text: '#2563eb' };
  if (crop.status === 'harvested') return { label: 'Harvested', bg: '#f5f5f5', text: '#525252' };
  return { label: 'Healthy', bg: '#f0fdf4', text: '#15803d' };
};

const healthColor = (score) => {
  if (score >= 80) return '#15803d';
  if (score >= 60) return '#d97706';
  return '#dc2626';
};

function Crops() {
  const { farms } = useFarm();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    setLoading(true);
    try {
      const data = await getAllCrops();
      setCrops(data);
    } catch (err) {
      console.error('Failed to load crops:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCrop(null);
    setForm({ ...emptyForm, farm: farms[0]?._id || '' });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (crop) => {
    setEditingCrop(crop);
    setForm({
      farm: crop.farm?._id || '',
      name: crop.name,
      plantingDate: crop.plantingDate?.split('T')[0] || '',
      expectedHarvestDate: crop.expectedHarvestDate?.split('T')[0] || '',
      expectedYield: crop.expectedYield || '',
      actualYield: crop.actualYield ?? '',
      healthScore: crop.healthScore ?? 100,
      status: crop.status,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingCrop) {
        await updateCrop(editingCrop._id, form);
      } else {
        await createCrop(form);
      }
      await loadCrops();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Crops">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Crops</h2>
          <p className="text-sm text-neutral-500 mt-1">Track planting cycles, yields, and crop health.</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={farms.length === 0}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> Add Crop
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h3 className="font-display font-bold text-neutral-900">All Crops</h3>
        </div>

        {loading ? (
          <p className="text-neutral-500 p-5">Loading crops...</p>
        ) : crops.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No crops yet</h3>
            <p className="text-sm text-neutral-500 mb-6">Add your first crop to start tracking yield and health.</p>
            {farms.length > 0 && (
              <button
                onClick={openCreateModal}
                className="text-white font-semibold px-5 py-2.5 rounded-xl"
                style={{ backgroundColor: '#15803d' }}
              >
                Add Crop
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Crop</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Farm</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Planted</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Harvest</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Expected Yield</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Health</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => {
                  const badge = getStatusBadge(crop);
                  return (
                    <tr key={crop._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                      <td className="px-5 py-4 font-semibold text-neutral-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f0fdf4' }}>
                          <Sprout size={15} style={{ color: '#15803d' }} />
                        </div>
                        {crop.name}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{crop.farm?.name || '—'}</td>
                      <td className="px-5 py-4 text-neutral-600">
                        {new Date(crop.plantingDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">
                        {crop.expectedHarvestDate
                          ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{crop.expectedYield || '—'} t</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${crop.healthScore}%`, backgroundColor: healthColor(crop.healthScore) }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-neutral-600">{crop.healthScore}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => openEditModal(crop)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition ml-auto">
                          <Pencil size={14} className="text-neutral-500" />
                        </button>
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
        title={editingCrop ? 'Edit Crop' : 'Add Crop'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingCrop && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Farm</label>
              <select
                required
                value={form.farm}
                onChange={(e) => setForm({ ...form, farm: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-white"
              >
                {farms.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Crop Name</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Maize"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Planting Date</label>
              <input
                type="date" required value={form.plantingDate}
                onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Expected Harvest</label>
              <input
                type="date" value={form.expectedHarvestDate}
                onChange={(e) => setForm({ ...form, expectedHarvestDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Expected Yield</label>
              <input
                type="number" required min="0" value={form.expectedYield}
                onChange={(e) => setForm({ ...form, expectedYield: e.target.value })}
                placeholder="500"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Actual Yield</label>
              <input
                type="number" min="0" value={form.actualYield}
                onChange={(e) => setForm({ ...form, actualYield: e.target.value })}
                placeholder="480"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Health Score ({form.healthScore}%)
            </label>
            <input
              type="range" min="0" max="100" value={form.healthScore}
              onChange={(e) => setForm({ ...form, healthScore: Number(e.target.value) })}
              className="w-full accent-green-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Lifecycle Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-white"
            >
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="ready_for_harvest">Ready for Harvest</option>
              <option value="harvested">Harvested</option>
            </select>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            style={{ backgroundColor: '#15803d' }}
          >
            {saving ? 'Saving...' : editingCrop ? 'Save Changes' : 'Add Crop'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

export default Crops;