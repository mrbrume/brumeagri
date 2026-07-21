import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import Layout from '../components/Layout';
import { useFarm } from '../context/FarmContext';
import { getExpensesByFarm } from '../services/expenseService';
import { getSalesByFarm } from '../services/saleService';
import { getInventoryByFarm } from '../services/inventoryService';
import { getCropPerformance } from '../services/dashboardService';

const COLORS = ['#15803d', '#22c55e', '#86efac', '#d97706', '#dc2626', '#2563eb'];

function Analytics() {
  const { activeFarm, loading: farmLoading } = useFarm();
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [inventoryBreakdown, setInventoryBreakdown] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [cropPerf, setCropPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeFarm) return;

    const load = async () => {
      setLoading(true);
      try {
        const [expenses, sales, inventory, crops] = await Promise.all([
          getExpensesByFarm(activeFarm._id),
          getSalesByFarm(activeFarm._id),
          getInventoryByFarm(activeFarm._id),
          getCropPerformance(activeFarm._id),
        ]);

        // Group expenses by category
        const expByCategory = {};
        expenses.forEach((e) => {
          expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;
        });
        setExpenseBreakdown(
          Object.entries(expByCategory).map(([name, value]) => ({ name, value }))
        );

        // Group inventory value by category
        const invByCategory = {};
        inventory.forEach((i) => {
          invByCategory[i.category] = (invByCategory[i.category] || 0) + (i.totalValue || 0);
        });
        setInventoryBreakdown(
          Object.entries(invByCategory).map(([name, value]) => ({ name, value }))
        );

        // Group sales by product, sum revenue, take top 5
        const salesByProduct = {};
        sales.forEach((s) => {
          salesByProduct[s.product] = (salesByProduct[s.product] || 0) + s.amount;
        });
        const sortedProducts = Object.entries(salesByProduct)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopProducts(sortedProducts);

        setCropPerf(crops);
      } catch (err) {
        console.error('Failed to load analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeFarm]);

  if (farmLoading || loading) {
    return (
      <Layout title="Analytics">
        <p className="text-neutral-500">Loading analytics...</p>
      </Layout>
    );
  }

  if (!activeFarm) {
    return (
      <Layout title="Analytics">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  // Crop yield efficiency: actual as % of expected
  const cropEfficiency = cropPerf
    .filter((c) => c.actualYield != null && c.expectedYield)
    .map((c) => ({
      name: c.name,
      efficiency: Math.round((c.actualYield / c.expectedYield) * 100),
    }));

  return (
    <Layout title="Analytics">
      <div className="mb-6">
        <h2 className="font-display font-extrabold text-2xl text-neutral-900">Analytics</h2>
        <p className="text-sm text-neutral-500 mt-1">Deeper insights into {activeFarm.name}'s performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Expense breakdown */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Expense Breakdown</h3>
          {expenseBreakdown.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No expense data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inventory value breakdown */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Inventory Value by Category</h3>
          {inventoryBreakdown.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No inventory data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={inventoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {inventoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Top Products by Revenue</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No sales data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#15803d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Crop yield efficiency */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5">
          <h3 className="font-display font-bold text-sm text-neutral-900 mb-4">Crop Yield Efficiency (%)</h3>
          {cropEfficiency.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No harvested crops with recorded yield yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cropEfficiency}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                  {cropEfficiency.map((entry, i) => (
                    <Cell key={i} fill={entry.efficiency >= 90 ? '#15803d' : entry.efficiency >= 70 ? '#d97706' : '#dc2626'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Analytics;