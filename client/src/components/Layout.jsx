import { useState, useEffect, useRef } from 'react';
import { Bell, Search, Plus, Menu, AlertTriangle, MapPin, Sprout, Boxes, ShoppingCart, Receipt, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useFarm } from '../context/FarmContext';
import { getNotifications } from '../services/dashboardService';
import { getAllCrops } from '../services/cropService';
import { getSalesByFarm } from '../services/saleService';

const NEW_ITEMS = [
  { label: 'New Farm', icon: MapPin, to: '/farms' },
  { label: 'New Crop', icon: Sprout, to: '/crops' },
  { label: 'Update Inventory', icon: Boxes, to: '/inventory' },
  { label: 'Record Sale', icon: ShoppingCart, to: '/sales' },
  { label: 'Add Expense', icon: Receipt, to: '/expenses' },
  { label: 'Add Worker', icon: Users, to: '/workers' },
];

function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ farms: [], crops: [], sales: [] });

  const { activeFarm, farms } = useFarm();
  const notifRef = useRef(null);
  const newMenuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeFarm) return;
    getNotifications(activeFarm._id).then(setNotifications).catch(() => setNotifications([]));
  }, [activeFarm]);

  useEffect(() => {
    const runSearch = async () => {
      const q = searchQuery.trim().toLowerCase();
      if (q.length < 2) {
        setSearchResults({ farms: [], crops: [], sales: [] });
        setSearchOpen(false);
        return;
      }

      const matchedFarms = farms.filter(
        (f) => f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q)
      ).slice(0, 4);

      let matchedCrops = [];
      let matchedSales = [];

      try {
        const allCrops = await getAllCrops();
        matchedCrops = allCrops.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4);
      } catch (err) {
        matchedCrops = [];
      }

      if (activeFarm) {
        try {
          const sales = await getSalesByFarm(activeFarm._id);
          matchedSales = sales.filter(
            (s) => s.product.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q)
          ).slice(0, 4);
        } catch (err) {
          matchedSales = [];
        }
      }

      setSearchResults({ farms: matchedFarms, crops: matchedCrops, sales: matchedSales });
      setSearchOpen(true);
    };

    const debounce = setTimeout(runSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, farms, activeFarm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setNewMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FAFAF7' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 bg-white border-b border-neutral-200 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition"
            >
              <Menu size={20} className="text-neutral-700" />
            </button>
            <div className="min-w-0">
              <p className="text-xs text-neutral-400 font-medium hidden md:block">BrumeAgri</p>
              <h1 className="font-display font-bold text-base md:text-lg text-neutral-900 truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {/* Search */}
            <div className="hidden md:block relative w-56 lg:w-72" ref={searchRef}>
              <div className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2">
                <Search size={16} className="text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
                  placeholder="Search farms, crops, sales…"
                  className="bg-transparent text-sm outline-none w-full placeholder:text-neutral-400"
                />
              </div>

              {searchOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchResults.farms.length === 0 && searchResults.crops.length === 0 && searchResults.sales.length === 0 ? (
                    <p className="text-sm text-neutral-400 p-4">No results found.</p>
                  ) : (
                    <>
                      {searchResults.farms.length > 0 && (
                        <div className="py-1.5">
                          <p className="px-4 py-1 text-[11px] font-semibold uppercase text-neutral-400">Farms</p>
                          {searchResults.farms.map((f) => (
                            <button
                              key={f._id}
                              onClick={() => { navigate('/farms'); setSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-neutral-50 transition"
                            >
                              <MapPin size={14} style={{ color: '#15803d' }} />
                              <span className="font-medium text-neutral-800">{f.name}</span>
                              <span className="text-neutral-400 text-xs">{f.location}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.crops.length > 0 && (
                        <div className="py-1.5 border-t border-neutral-100">
                          <p className="px-4 py-1 text-[11px] font-semibold uppercase text-neutral-400">Crops</p>
                          {searchResults.crops.map((c) => (
                            <button
                              key={c._id}
                              onClick={() => { navigate('/crops'); setSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-neutral-50 transition"
                            >
                              <Sprout size={14} style={{ color: '#15803d' }} />
                              <span className="font-medium text-neutral-800">{c.name}</span>
                              <span className="text-neutral-400 text-xs">{c.farm?.name}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.sales.length > 0 && (
                        <div className="py-1.5 border-t border-neutral-100">
                          <p className="px-4 py-1 text-[11px] font-semibold uppercase text-neutral-400">Sales</p>
                          {searchResults.sales.map((s) => (
                            <button
                              key={s._id}
                              onClick={() => { navigate('/sales'); setSearchOpen(false); setSearchQuery(''); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-neutral-50 transition"
                            >
                              <ShoppingCart size={14} style={{ color: '#15803d' }} />
                              <span className="font-medium text-neutral-800">{s.product}</span>
                              <span className="text-neutral-400 text-xs">{s.customer}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* + New dropdown */}
            <div className="relative hidden sm:block" ref={newMenuRef}>
              <button
                onClick={() => setNewMenuOpen(!newMenuOpen)}
                className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition hover:opacity-90"
                style={{ backgroundColor: '#15803d' }}
              >
                <Plus size={16} /> New
              </button>

              {newMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 py-1.5">
                  {NEW_ITEMS.map(({ label, icon: Icon, to }) => (
                    <button
                      key={label}
                      onClick={() => { navigate(to); setNewMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition text-left"
                    >
                      <Icon size={15} style={{ color: '#15803d' }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition flex-shrink-0"
              >
                <Bell size={18} className="text-neutral-600" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-display font-bold text-sm text-neutral-900">Notifications</p>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-neutral-400 p-4">No notifications right now.</p>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="flex gap-2.5 px-4 py-3 border-b border-neutral-50 last:border-0">
                        <AlertTriangle
                          size={15}
                          className={`flex-shrink-0 mt-0.5 ${n.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-neutral-800">{n.message}</p>
                          <p className="text-xs text-neutral-400">{n.detail}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}

export default Layout;