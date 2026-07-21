import { useState, useEffect } from 'react';
import { Users, MapPin, ShieldCheck, Eye, Wrench, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import { getSystemStats, getAllUsers, getAllFarms } from '../services/adminService';

const ROLE_META = {
  owner: { label: 'Owner', icon: Crown, color: '#15803d' },
  manager: { label: 'Manager', icon: Wrench, color: '#2563eb' },
  investor: { label: 'Investor', icon: Eye, color: '#d97706' },
  admin: { label: 'Admin', icon: ShieldCheck, color: '#dc2626' },
};

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [tab, setTab] = useState('farms');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, usersData, farmsData] = await Promise.all([
          getSystemStats(),
          getAllUsers(),
          getAllFarms(),
        ]);
        setStats(statsData);
        setUsers(usersData);
        setFarms(farmsData);
      } catch (err) {
        console.error('Failed to load admin data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Layout title="Admin">
        <p className="text-neutral-500">Loading system data...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Admin">
      <div className="mb-6">
        <h2 className="font-display font-extrabold text-2xl text-neutral-900">System Administration</h2>
        <p className="text-sm text-neutral-500 mt-1">System-wide view across every farm and user on BrumeAgri.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Farms</p>
            <MapPin size={16} style={{ color: '#15803d' }} />
          </div>
          <p className="font-display font-extrabold text-2xl text-neutral-900">{stats?.totalFarms ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Total Users</p>
            <Users size={16} style={{ color: '#15803d' }} />
          </div>
          <p className="font-display font-extrabold text-2xl text-neutral-900">{stats?.totalUsers ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Role Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats?.roleBreakdown || {}).map(([role, count]) => {
              const meta = ROLE_META[role];
              return (
                <span
                  key={role}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                >
                  {meta.label}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('farms')}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition"
          style={tab === 'farms' ? { backgroundColor: '#15803d', color: 'white' } : { backgroundColor: '#f5f5f5', color: '#525252' }}
        >
          All Farms
        </button>
        <button
          onClick={() => setTab('users')}
          className="text-sm font-semibold px-4 py-2 rounded-xl transition"
          style={tab === 'users' ? { backgroundColor: '#15803d', color: 'white' } : { backgroundColor: '#f5f5f5', color: '#525252' }}
        >
          All Users
        </button>
      </div>

      {tab === 'farms' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Farm</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Location</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Managers</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Investors</th>
              </tr>
            </thead>
            <tbody>
              {farms.map((farm) => (
                <tr key={farm._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                  <td className="px-5 py-4 font-semibold text-neutral-900">{farm.name}</td>
                  <td className="px-5 py-4 text-neutral-600">{farm.owner?.name} <span className="text-neutral-400">({farm.owner?.email})</span></td>
                  <td className="px-5 py-4 text-neutral-600">{farm.location}</td>
                  <td className="px-5 py-4 text-neutral-600">{farm.managers?.length || 0}</td>
                  <td className="px-5 py-4 text-neutral-600">{farm.investors?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-neutral-500 text-xs uppercase tracking-wide">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const meta = ROLE_META[u.role] || ROLE_META.owner;
                return (
                  <tr key={u._id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                    <td className="px-5 py-4 font-semibold text-neutral-900">{u.name}</td>
                    <td className="px-5 py-4 text-neutral-600">{u.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Admin;