import { useState } from 'react';
import { FileBarChart, ShoppingCart, Receipt, Boxes, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { useFarm } from '../context/FarmContext';
import { downloadSalesReport, downloadExpenseReport, downloadInventoryReport } from '../services/reportService';

const REPORTS = [
  {
    key: 'sales',
    title: 'Sales Report',
    description: 'A full record of every sale, including product, quantity, customer, and amount.',
    icon: ShoppingCart,
    action: downloadSalesReport,
  },
  {
    key: 'expenses',
    title: 'Expense Report',
    description: 'A breakdown of all expenses by category, with descriptions and amounts.',
    icon: Receipt,
    action: downloadExpenseReport,
  },
  {
    key: 'inventory',
    title: 'Inventory Report',
    description: 'Current stock levels, unit costs, total value, and low-stock status for every item.',
    icon: Boxes,
    action: downloadInventoryReport,
  },
];

function Reports() {
  const { activeFarm } = useFarm();
  const [downloadingKey, setDownloadingKey] = useState(null);
  const [error, setError] = useState('');

  const handleDownload = async (report) => {
    setError('');
    setDownloadingKey(report.key);
    try {
      await report.action(activeFarm._id);
    } catch (err) {
      setError(`Failed to generate ${report.title}. Please try again.`);
    } finally {
      setDownloadingKey(null);
    }
  };

  if (!activeFarm) {
    return (
      <Layout title="Reports">
        <p className="text-neutral-500">Select or create a farm first.</p>
      </Layout>
    );
  }

  return (
    <Layout title="Reports">
      <div className="mb-6">
        <h2 className="font-display font-extrabold text-2xl text-neutral-900">Reports</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Download PDF reports for {activeFarm.name}.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm max-w-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloadingKey === report.key;
          return (
            <div key={report.key} className="bg-white rounded-2xl border border-neutral-200 p-5 flex flex-col">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: '#f0fdf4' }}
              >
                <Icon size={18} style={{ color: '#15803d' }} />
              </div>
              <h3 className="font-display font-bold text-neutral-900 mb-1.5">{report.title}</h3>
              <p className="text-sm text-neutral-500 mb-5 flex-1">{report.description}</p>
              <button
                onClick={() => handleDownload(report)}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 text-white font-semibold text-sm py-2.5 rounded-xl transition hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#15803d' }}
              >
                <Download size={15} />
                {isDownloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}

export default Reports;