import { useState, useEffect } from 'react';
import {
  DollarSign, Receipt, Boxes, ShoppingCart, TrendingUp, Users, Activity, Download,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout';
import { useFarm } from '../context/FarmContext';
import { getDashboardSummary, getMonthlyRevenue } from '../services/dashboardService';
import { getSalesByFarm } from '../services/saleService';
import { getExpensesByFarm } from '../services/expenseService';
import { getAttendanceSummary } from '../services/dashboardService';
import { getMyInvestmentSummary } from '../services/investmentService';
import { downloadSalesReport } from '../services/reportService';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function InvestorView() {
  const { activeFarm, loading: farmLoading } = useFarm();
  const [summary, setSummary] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [noInvestment, setNoInvestment] = useState(false);
  const [recentSalesTotal, setRecentSalesTotal] = useState(0);
  const [recentExpensesTotal, setRecentExpensesTotal] = useState(0);
  const [attendance, setAttendance] = useState(null);
  const [roiChartData, setRoiChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeFarm) return;

    const load = async () => {
      setLoading(true);
      setNoInvestment(false);

      try {
        const [summaryData, salesData, expensesData, attendanceData, monthlyRevenue] = await Promise.all([
          getDashboardSummary(activeFarm._id),
          getSalesByFarm(activeFarm._id),
          getExpensesByFarm(activeFarm._id),
          getAttendanceSummary(activeFarm._id),
          getMonthlyRevenue(activeFarm._id),
        ]);

        setSummary(summaryData);
        setAttendance(attendanceData);

        // "This week" totals
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        setRecentSalesTotal(
          salesData.filter((s) => new Date(s.date) >= oneWeekAgo).reduce((sum, s) => sum + s.amount, 0)
        );
        setRecentExpensesTotal(
          expensesData.filter((e) => new Date(e.date) >= oneWeekAgo).reduce((sum, e) => sum + e.amount, 0)
        );

        // Simple ROI trend approximation from monthly revenue (for chart shape only)
        setRoiChartData(
          monthlyRevenue.map((r) => ({
            name: MONTH_NAMES[r._id.month - 1],
            value: r.totalRevenue,
          }))
        );

        try {
          const investData = await getMyInvestmentSummary(activeFarm._id);
          setInvestment(investData);
        } catch (err) {
          setNoInvestment(true);
        }
      } catch (err) {
        console.error('Failed to load investor view:', err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeFarm]);

  if (farmLoading || loading) {
    return (
      <Layout title="Investor View">
        <p className="text-neutral-500">Loading...</p>
      </Layout>
    );
  }

  if (!activeFarm) {
    return (
      <Layout title="Investor View">
        <p className="text-neutral-500">No farm to display yet.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Investor View">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-neutral-900">Investor Overview</h2>
          <p className="text-sm text-neutral-500 mt-1">Transparent, live view of your farm operations.</p>
        </div>
        <button
          onClick={() => downloadSalesReport(activeFarm._id)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
        >
          <Download size={15} /> Download Report
        </button>
      </div>

      {/* Portfolio banner */}
      <div
        className="rounded-2xl p-6 mb-5 grid grid-cols-1 md:grid-cols-3 gap-6"
        style={{
          backgroundColor: '#052e16',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#86efac' }}>Portfolio</p>
          <p className="font-display font-extrabold text-white text-lg mt-1">{activeFarm.name}</p>
          <p className="text-sm text-neutral-400 mt-0.5">{activeFarm.location}</p>
        </div>

        {investment && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#86efac' }}>Your Investment</p>
              <p className="font-display font-extrabold text-white text-lg mt-1">
                ₦{investment.investment.amount.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-400 mt-0.5">
                Since {new Date(investment.investment.investmentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#86efac' }}>ROI to Date</p>
              <p className="font-display font-extrabold text-lg mt-1" style={{ color: '#86efac' }}>
                +{investment.roiPercentage}%
              </p>
              <p className="text-sm text-neutral-400 mt-0.5">₦{investment.returnsToDate.toLocaleString()} returns</p>
            </div>
          </>
        )}

        {noInvestment && (
          <div className="md:col-span-2 flex items-center">
            <p className="text-sm text-neutral-400">No investment record found for your account on this farm yet.</p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recent Sales</p>
            <ShoppingCart size={16} style={{ color: '#15803d' }} />
          </div>
          <p className="font-display font-extrabold text-xl text-neutral-900">₦{recentSalesTotal.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">This week</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Recent Expenses</p>
            <Receipt size={16} className="text-red-500" />
          </div>
          <p className="font-display font-extrabold text-xl text-neutral-900">₦{recentExpensesTotal.toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">This week</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Current Inventory</p>
            <Boxes size={16} style={{ color: '#15803d' }} />
          </div>
          <p className="font-display font-extrabold text-xl text-neutral-900">₦{(summary?.inventoryValue || 0).toLocaleString()}</p>
          <p className="text-xs text-neutral-400 mt-1">Value in stock</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Worker Activity</p>
            <Activity size={16} style={{ color: '#15803d' }} />
          </div>
          <p className="font-display font-extrabold text-xl text-neutral-900">
            {attendance && attendance.totalActiveWorkers > 0
              ? `${Math.round((attendance.present / attendance.totalActiveWorkers) * 100)}%`
              : '—'}
          </p>
          <p className="text-xs text-neutral-400 mt-1">Attendance today</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue trend as ROI proxy */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Revenue Trend</h3>
          {roiChartData.length === 0 ? (
            <p className="text-sm text-neutral-400 py-16 text-center">Not enough data yet to show a trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={roiChartData}>
                <defs>
                  <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                <Area type="monotone" dataKey="value" stroke="#15803d" fill="url(#roiFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Farm live status */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Farm Live Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800">Farm Operations</p>
                <p className="text-xs text-neutral-400">All records up to date</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-800">Worker Attendance</p>
                <p className="text-xs text-neutral-400">
                  {attendance ? `${attendance.present}/${attendance.totalActiveWorkers} present today` : '—'}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#15803d' }}>
                Healthy
              </span>
            </div>
            {investment?.investment?.nextPayoutDate && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Next Payout</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(investment.investment.nextPayoutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                  Scheduled
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly performance report */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">
          Monthly Performance Report · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 mb-1">Gross Revenue</p>
            <p className="font-display font-extrabold text-lg text-neutral-900">
              ₦{(summary?.totalRevenue || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Operating Cost</p>
            <p className="font-display font-extrabold text-lg text-neutral-900">
              ₦{(summary?.totalExpenses || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Net Profit</p>
            <p className="font-display font-extrabold text-lg text-neutral-900">
              ₦{(summary?.monthlyProfit || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1">Investor Share</p>
            <p className="font-display font-extrabold text-lg" style={{ color: '#15803d' }}>
              {investment ? `₦${investment.returnsToDate.toLocaleString()}` : '—'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default InvestorView;