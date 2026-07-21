import { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Check, X as XIcon } from 'lucide-react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { useFarm } from '../context/FarmContext';
import {
  getWorkersByFarm, createWorker, updateWorker, deleteWorker,
} from '../services/workerService';
import { markAttendance, getTodayAttendance } from '../services/attendanceService';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', position: '', contact: '', status: 'active' };

function Workers() {
  const { activeFarm } = useFarm();
  const { user } = useAuth();
  const canDelete = user?.role === 'owner' || user?.role === 'admin';
  const [workers, setWorkers] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeFarm) return;
    loadData();
  }, [activeFarm]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workersData, attendanceData] = await Promise.all([
        getWorkersByFarm(activeFarm._id),
        getTodayAttendance(activeFarm._id),
      ]);
      setWorkers(workersData);

      const attMap = {};
      attendanceData.forEach((rec) => {
        attMap[rec.worker._id] = rec.status;
      });
      setTodayAttendance(attMap);
    } catch (err) {
      console.error('Failed to load workers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingWorker(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (worker) => {
    setEditingWorker(worker);
    setForm({
      name: worker.name,
      position: worker.position,
      contact: worker.contact || '',
      status: worker.status,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingWorker) {
        const updated = await updateWorker(editingWorker._id, form);
        setWorkers(workers.map((w) => (w._id === updated._id ? updated : w)));
      } else {
        const created = await createWorker({ ...form, farm: activeFarm._id });
        setWorkers([created, ...workers]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (worker) => {
    if (!confirm(`Delete "${worker.name}"? This cannot be undone.`)) return;
    try {
      await deleteWorker(worker._id);
      setWorkers(workers.filter((w) => w._id !== worker._id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete worker.');
    }
  };

  const handleMarkAttendance = async (worker, status) => {
    try {
      await markAttendance({ farm: activeFarm._id, worker: worker._id, status });
      setTodayAttendance({ ...todayAttendance, [worker._id]: status });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance.');
    }
  };

  if (!activeFarm) {
    return (
      <Layout title="Workers">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  const activeCount = workers.filter((w) => w.status === 'active').length;
  const presentToday = Object.values(todayAttendance).filter((s) => s === 'present').length;

  return (
    <Layout title="Workers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Workers</h2>
          <p className="text-sm text-neutral-500 mt-1">
            {activeCount} active · {presentToday} present today
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          <Plus size={16} /> Add Worker
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading workers...</p>
      ) : workers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center max-w-md mx-auto mt-16">
          <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">No workers yet</h3>
          <p className="text-sm text-neutral-500 mb-6">Add your first worker to start tracking attendance.</p>
          <button
            onClick={openCreateModal}
            className="text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Add Worker
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Position</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Contact</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Today's Attendance</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => {
                  const attStatus = todayAttendance[worker._id];
                  return (
                    <tr key={worker._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                      <td className="px-5 py-4 font-semibold text-neutral-900 flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: '#15803d' }}
                        >
                          {worker.name.charAt(0)}
                        </div>
                        {worker.name}
                      </td>
                      <td className="px-5 py-4 text-neutral-600">{worker.position}</td>
                      <td className="px-5 py-4 text-neutral-600">{worker.contact || '—'}</td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                          style={
                            worker.status === 'active'
                              ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                              : { backgroundColor: '#f5f5f5', color: '#525252' }
                          }
                        >
                          {worker.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {attStatus ? (
                          <span
                            className="inline-block text-xs font-semibold px-3 py-1 rounded-full capitalize"
                            style={
                              attStatus === 'present'
                                ? { backgroundColor: '#f0fdf4', color: '#15803d' }
                                : attStatus === 'leave'
                                ? { backgroundColor: '#fffbeb', color: '#d97706' }
                                : { backgroundColor: '#fef2f2', color: '#dc2626' }
                            }
                          >
                            {attStatus}
                          </span>
                        ) : (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleMarkAttendance(worker, 'present')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 hover:bg-green-100 transition"
                              title="Mark present"
                            >
                              <Check size={14} className="text-green-700" />
                            </button>
                            <button
                              onClick={() => handleMarkAttendance(worker, 'absent')}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 transition"
                              title="Mark absent"
                            >
                              <XIcon size={14} className="text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => openEditModal(worker)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition">
                            <Pencil size={14} className="text-neutral-500" />
                          </button>
                          {canDelete && (
                            <button onClick={() => handleDelete(worker)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition">
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
        </div>
      )}

      <Modal
        title={editingWorker ? 'Edit Worker' : 'Add Worker'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Full Name</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Musa Ibrahim"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Position</label>
            <input
              type="text" required value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              placeholder="Field Supervisor"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Contact</label>
            <input
              type="text" value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="08012345678"
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none"
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
              onBlur={(e) => e.target.style.boxShadow = 'none'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
            style={{ backgroundColor: '#15803d' }}
          >
            {saving ? 'Saving...' : editingWorker ? 'Save Changes' : 'Add Worker'}
          </button>
        </form>
      </Modal>
    </Layout>
  );
}

export default Workers;