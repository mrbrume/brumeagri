import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import { createFarm, updateFarm, deleteFarm } from '../services/farmService';
import { UserPlus } from 'lucide-react';
import { addInvestorToFarm, addManagerToFarm } from '../services/farmService';
import { createInvestment, getFarmInvestments } from '../services/investmentService';
import { removeManagerFromFarm, removeInvestorFromFarm } from '../services/farmService';
import { X } from 'lucide-react';

const emptyForm = { name: '', location: '', size: '', description: '' };

function Farms() {
  const { farms, setFarms, activeFarm, setActiveFarm } = useFarm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [investorModalOpen, setInvestorModalOpen] = useState(false);
  const [investorFarm, setInvestorFarm] = useState(null);
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorError, setInvestorError] = useState('');
  const [addingInvestor, setAddingInvestor] = useState(false);
  const [linkedInvestor, setLinkedInvestor] = useState(null); // set once email lookup succeeds
  const [investmentForm, setInvestmentForm] = useState({
    amount: '', sharePercentage: '', investmentDate: '', nextPayoutDate: '',
  });
  const [savingInvestment, setSavingInvestment] = useState(false);
  const [existingInvestments, setExistingInvestments] = useState([]);
  const [assignMode, setAssignMode] = useState('investor'); // 'investor' or 'manager'

  const openCreateModal = () => {
    setEditingFarm(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setForm({
      name: farm.name,
      location: farm.location,
      size: farm.size || '',
      description: farm.description || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingFarm) {
        const updated = await updateFarm(editingFarm._id, form);
        setFarms(farms.map((f) => (f._id === updated._id ? updated : f)));
        if (activeFarm?._id === updated._id) setActiveFarm(updated);
      } else {
        const created = await createFarm(form);
        setFarms([...farms, created]);
        if (!activeFarm) setActiveFarm(created);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm) => {
    if (!confirm(`Delete "${farm.name}"? This cannot be undone.`)) return;
    try {
      await deleteFarm(farm._id);
      const remaining = farms.filter((f) => f._id !== farm._id);
      setFarms(remaining);
      if (activeFarm?._id === farm._id) {
        setActiveFarm(remaining[0] || null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete farm.');
    }
  };

  const handleRemoveManager = async (farmId, userId) => {
    if (!confirm('Remove this manager from the farm?')) return;
    try {
      const updated = await removeManagerFromFarm(farmId, userId);
      setFarms(farms.map((f) => (f._id === updated.farm._id ? updated.farm : f)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove manager.');
    }
  };

  const handleRemoveInvestor = async (farmId, userId) => {
    if (!confirm('Remove this investor from the farm?')) return;
    try {
      const updated = await removeInvestorFromFarm(farmId, userId);
      setFarms(farms.map((f) => (f._id === updated.farm._id ? updated.farm : f)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove investor.');
    }
  };

  const openInvestorModal = async (farm) => {
    setInvestorFarm(farm);
    setInvestorEmail('');
    setInvestorError('');
    setLinkedInvestor(null);
    setAssignMode('investor');
    setInvestmentForm({ amount: '', sharePercentage: '', investmentDate: '', nextPayoutDate: '' });
    setInvestorModalOpen(true);
    try {
      const investments = await getFarmInvestments(farm._id);
      setExistingInvestments(investments);
    } catch (err) {
      setExistingInvestments([]);
    }
  };

  const handleAddInvestor = async (e) => {
    e.preventDefault();
    setInvestorError('');
    setAddingInvestor(true);
    try {
      if (assignMode === 'manager') {
        await addManagerToFarm(investorFarm._id, investorEmail);
        setInvestorModalOpen(false);
      } else {
        const result = await addInvestorToFarm(investorFarm._id, investorEmail);
        setLinkedInvestor(result.investor);
      }
    } catch (err) {
      setInvestorError(err.response?.data?.message || 'Failed to add.');
    } finally {
      setAddingInvestor(false);
    }
  };

  const handleSaveInvestment = async (e) => {
    e.preventDefault();
    setInvestorError('');
    setSavingInvestment(true);
    try {
      await createInvestment({
        farm: investorFarm._id,
        investor: linkedInvestor._id,
        amount: investmentForm.amount,
        sharePercentage: investmentForm.sharePercentage,
        investmentDate: investmentForm.investmentDate,
        nextPayoutDate: investmentForm.nextPayoutDate || undefined,
      });
      const investments = await getFarmInvestments(investorFarm._id);
      setExistingInvestments(investments);
      setInvestorModalOpen(false);
    } catch (err) {
      setInvestorError(err.response?.data?.message || 'Failed to save investment details.');
    } finally {
      setSavingInvestment(false);
    }
  };

  return (
    <Layout title="Farms">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Your Farms</h2>
          <p className="text-sm text-neutral-500 mt-1">Manage all the farms you own or oversee.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> New Farm
        </button>
      </div>

      {farms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center max-w-md mx-auto mt-16">
          <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No farms yet</h3>
          <p className="text-sm text-neutral-500 mb-6">Create your first farm to get started.</p>
          <button
            onClick={openCreateModal}
            className="text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Create a Farm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => (
            <div
              key={farm._id}
              className={`bg-white rounded-2xl border p-5 transition ${
                activeFarm?._id === farm._id ? 'border-green-600' : 'border-neutral-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: '#f0fdf4' }}
                >
                  <MapPin size={18} style={{ color: '#15803d' }} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openInvestorModal(farm)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition"
                    title="Add investor"
                  >
                    <UserPlus size={15} className="text-neutral-500" />
                  </button>
                  <button
                    onClick={() => openEditModal(farm)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition"
                  >
                    <Pencil size={15} className="text-neutral-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(farm)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="font-display font-bold text-neutral-900 mb-1">{farm.name}</h3>
              <p className="text-sm text-neutral-500 mb-3">{farm.location}</p>

              {farm.size && (
                <p className="text-xs text-neutral-400 mb-3">{farm.size} acres</p>
              )}

              {activeFarm?._id === farm._id ? (
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}
                >
                  Active
                </span>
              ) : (
                <button
                  onClick={() => setActiveFarm(farm)}
                  className="text-xs font-semibold text-neutral-500 hover:text-green-700 transition"
                >
                  Set as active
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editingFarm ? 'Edit Farm' : 'Create Farm'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Farm Name
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Green Valley Farm"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Location
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Kaduna, Nigeria"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Size (acres)
            </label>
            <input
              type="number"
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="25"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mixed crop and livestock farm"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none resize-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            style={{ backgroundColor: '#15803d' }}
          >
            {saving ? 'Saving...' : editingFarm ? 'Save Changes' : 'Create Farm'}
          </button>
        </form>
      </Modal>

      <Modal
        title={`Team — ${investorFarm?.name || ''}`}
        isOpen={investorModalOpen}
        onClose={() => setInvestorModalOpen(false)}
      >
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => { setAssignMode('investor'); setLinkedInvestor(null); setInvestorError(''); }}
            className="flex-1 text-sm font-semibold py-2 rounded-xl transition"
            style={
              assignMode === 'investor'
                ? { backgroundColor: '#15803d', color: 'white' }
                : { backgroundColor: '#f5f5f5', color: '#525252' }
            }
          >
            Investor
          </button>
          <button
            onClick={() => { setAssignMode('manager'); setLinkedInvestor(null); setInvestorError(''); }}
            className="flex-1 text-sm font-semibold py-2 rounded-xl transition"
            style={
              assignMode === 'manager'
                ? { backgroundColor: '#15803d', color: 'white' }
                : { backgroundColor: '#f5f5f5', color: '#525252' }
            }
          >
            Manager
          </button>
        </div>
        {assignMode === 'investor' && existingInvestments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Current Investors
            </p>
            <div className="space-y-2">
              {existingInvestments.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{inv.investor?.name}</p>
                    <p className="text-xs text-neutral-500">{inv.investor?.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-neutral-900">₦{inv.amount.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500">{inv.sharePercentage}% share</p>
                    </div>
                    <button
                      onClick={() => handleRemoveInvestor(investorFarm._id, inv.investor._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition flex-shrink-0"
                    >
                      <X size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {assignMode === 'manager' && investorFarm?.managers?.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
              Current Managers
            </p>
            <div className="space-y-2">
              {investorFarm.managers.map((mgr) => (
                <div key={mgr._id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-neutral-200">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{mgr.name}</p>
                    <p className="text-xs text-neutral-500">{mgr.email}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveManager(investorFarm._id, mgr._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
          {assignMode === 'manager' ? 'Add a Manager' : 'Add a New Investor'}
        </p>

        {investorError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{investorError}</div>
        )}

        {!linkedInvestor ? (
          <form onSubmit={handleAddInvestor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                {assignMode === 'manager' ? 'Manager Email' : 'Investor Email'}
              </label>
              <input
                type="email"
                required
                value={investorEmail}
                onChange={(e) => setInvestorEmail(e.target.value)}
                placeholder="investor@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
              />
              <p className="text-xs text-neutral-400 mt-1.5">Must be a registered BrumeAgri account.</p>
            </div>

            <button
              type="submit"
              disabled={addingInvestor}
              className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              style={{ backgroundColor: '#15803d' }}
            >
              {addingInvestor ? 'Saving...' : assignMode === 'manager' ? 'Add Manager' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSaveInvestment} className="space-y-4">
            <div className="px-3 py-2.5 rounded-xl bg-green-50 text-sm text-green-800">
              Linking <strong>{linkedInvestor.name}</strong> ({linkedInvestor.email}) — now enter their investment details:
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number" required
                  value={investmentForm.amount}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                  placeholder="1000000"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Share (%)
                </label>
                <input
                  type="number" required min="0" max="100"
                  value={investmentForm.sharePercentage}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, sharePercentage: e.target.value })}
                  placeholder="20"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Investment Date
                </label>
                <input
                  type="date" required
                  value={investmentForm.investmentDate}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, investmentDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                  Next Payout (optional)
                </label>
                <input
                  type="date"
                  value={investmentForm.nextPayoutDate}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, nextPayoutDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingInvestment}
              className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
              style={{ backgroundColor: '#15803d' }}
            >
              {savingInvestment ? 'Saving...' : 'Save Investment'}
            </button>
          </form>
        )}
      </Modal>
    </Layout>
  );
}

export default Farms;