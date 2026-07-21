import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Receipt, Boxes, TrendingUp, Users, ShoppingCart,
  Plus, Cloud, CloudRain, Sun, AlertTriangle, Bell
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { useFarm } from '../context/FarmContext';
import {
  getDashboardSummary, getMonthlyRevenue, getMonthlyExpenses,
  getCropPerformance, getWeather, getNotifications,
  getRecentActivity, getAttendanceSummary
} from '../services/dashboardService';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function Dashboard() {
  const { user } = useAuth();
  const { activeFarm, loading: farmLoading } = useFarm();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [cropPerf, setCropPerf] = useState([]);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeFarm) return;

    const loadAll = async () => {
      setLoading(true);
      const farmId = activeFarm._id;

      const [
        summaryRes, revenueRes, expensesRes, cropRes,
        weatherRes, notifRes, activityRes, attendanceRes
      ] = await Promise.allSettled([
        getDashboardSummary(farmId),
        getMonthlyRevenue(farmId),
        getMonthlyExpenses(farmId),
        getCropPerformance(farmId),
        getWeather(farmId),
        getNotifications(farmId),
        getRecentActivity(farmId),
        getAttendanceSummary(farmId),
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
      if (cropRes.status === 'fulfilled') setCropPerf(cropRes.value);
      if (weatherRes.status === 'fulfilled') setWeather(weatherRes.value);
      if (notifRes.status === 'fulfilled') setNotifications(notifRes.value);
      if (activityRes.status === 'fulfilled') setActivity(activityRes.value);
      if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value);

      // Merge monthly revenue + expenses into one dataset for the chart
      if (revenueRes.status === 'fulfilled' && expensesRes.status === 'fulfilled') {
        const revMap = {};
        revenueRes.value.forEach((r) => {
          revMap[`${r._id.year}-${r._id.month}`] = r.totalRevenue;
        });
        const expMap = {};
        expensesRes.value.forEach((e) => {
          expMap[`${e._id.year}-${e._id.month}`] = e.totalExpenses;
        });
        const allKeys = new Set([...Object.keys(revMap), ...Object.keys(expMap)]);
        const merged = Array.from(allKeys).sort().map((key) => {
          const [year, month] = key.split('-');
          return {
            name: MONTH_NAMES[parseInt(month) - 1],
            revenue: revMap[key] || 0,
            expenses: expMap[key] || 0,
          };
        });
        setChartData(merged);
      }

      setLoading(false);
    };

    loadAll();
  }, [activeFarm]);

  const weatherIcon = (condition) => {
    if (!condition) return Sun;
    if (condition.toLowerCase().includes('rain')) return CloudRain;
    if (condition.toLowerCase().includes('cloud')) return Cloud;
    return Sun;
  };

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (farmLoading) {
    return (
      <Layout title="Dashboard">
        <p className="text-neutral-500">Loading your farm...</p>
      </Layout>
    );
  }

  if (!activeFarm) {
    return (
      <Layout title="Dashboard">
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center max-w-md mx-auto mt-16">
          <h2 className="font-display font-bold text-xl text-neutral-900 mb-2">No farm yet</h2>
          <p className="text-sm text-neutral-500 mb-6">Create your first farm to start seeing your dashboard.</p>
          <button
            className="text-white font-semibold px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: '#15803d' }}
          >
            Create a Farm
          </button>
        </div>
      </Layout>
    );
  }

  const WeatherIcon = weatherIcon(weather?.current?.condition);

  return (
    <Layout title="Dashboard">
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-sm text-neutral-500 mt-1">Here's an overview of today's farm operations.</p>
        </div>
        <button className="text-sm font-semibold px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition">
          Export
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Record Sale', icon: ShoppingCart, to: '/sales' },
          { label: 'Add Expense', icon: Receipt, to: '/expenses' },
          { label: 'Update Inventory', icon: Boxes, to: '/inventory' },
          { label: 'Add Worker', icon: Users, to: '/workers' },
        ].map(({ label, icon: Icon, to }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl px-4 py-3.5 hover:border-green-600 transition text-left"
          >
            <span className="flex items-center gap-2.5 text-sm font-semibold text-neutral-800">
              <Icon size={16} style={{ color: '#15803d' }} /> {label}
            </span>
            <Plus size={15} className="text-neutral-400" />
          </button>
        ))}
      </div>

     {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`₦${(summary?.totalRevenue || 0).toLocaleString()}`}
        />
        <StatCard
          icon={Receipt}
          label="Total Expenses"
          value={`₦${(summary?.totalExpenses || 0).toLocaleString()}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Profit"
          value={`₦${(summary?.monthlyProfit || 0).toLocaleString()}`}
        />
        <StatCard
          icon={Boxes}
          label="Inventory Value"
          value={`₦${(summary?.inventoryValue || 0).toLocaleString()}`}
        />
        <StatCard
          icon={Users}
          label="Active Workers"
          value={summary?.activeWorkers ?? 0}
          sublabel={attendance ? `${attendance.present}/${attendance.totalActiveWorkers} present today` : null}
        />
        <StatCard label="Pending Orders" comingSoon />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#15803d" fill="url(#rev)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#dc2626" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weather */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">
            Weather · {activeFarm.location}
          </h3>
          {weather ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <WeatherIcon size={36} style={{ color: '#15803d' }} />
                <div>
                  <p className="font-display font-extrabold text-2xl text-neutral-900">{weather.current.temp}°C</p>
                  <p className="text-xs text-neutral-500">
                    {weather.current.condition} · Humidity {weather.current.humidity}%
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {weather.forecast?.map((f) => (
                  <div key={f.date} className="text-center bg-neutral-50 rounded-lg py-2">
                    <p className="text-[11px] text-neutral-500">{f.date.slice(5)}</p>
                    <p className="text-sm font-semibold text-neutral-900">{f.temp}°</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-400">Weather unavailable</p>
          )}
        </div>
      </div>

      {/* Crop performance + Activity/Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-sm text-neutral-900">Crop Performance</h3>
            <span className="text-xs text-neutral-400">Expected vs actual yield</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="expectedYield" fill="#d4d4d4" radius={[4, 4, 0, 0]} name="Expected" />
              <Bar dataKey="actualYield" fill="#15803d" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-5">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {activity.length === 0 && <p className="text-sm text-neutral-400">No recent activity</p>}
              {activity.map((a) => (
                <div key={a._id} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#15803d' }}></div>
                  <div>
                    <p className="text-sm text-neutral-800">{a.message}</p>
                    <p className="text-xs text-neutral-400">{a.user?.name} · {timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-5">
            <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              {notifications.length === 0 && <p className="text-sm text-neutral-400">No notifications</p>}
              {notifications.map((n, i) => (
                <div key={i} className="flex gap-2.5">
                  {n.severity === 'warning' ? (
                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Bell size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{n.message}</p>
                    <p className="text-xs text-neutral-400">{n.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;