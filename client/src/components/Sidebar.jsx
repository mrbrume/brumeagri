import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Sprout, Rabbit, Boxes, ShoppingCart,
  Receipt, Users, Contact, FileBarChart, LineChart, Eye, Settings, X, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ALL_ROLES = ['owner', 'manager', 'admin', 'investor'];
const OPERATIONAL_ROLES = ['owner', 'manager', 'admin'];
const OVERSIGHT_ROLES = ['owner', 'admin', 'investor'];

const workspaceLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL_ROLES },
  { to: '/farms', label: 'Farms', icon: MapPin, roles: OPERATIONAL_ROLES },
  { to: '/crops', label: 'Crops', icon: Sprout, roles: OPERATIONAL_ROLES },
  { to: '/livestock', label: 'Livestock', icon: Rabbit, roles: ALL_ROLES },
  { to: '/inventory', label: 'Inventory', icon: Boxes, roles: OPERATIONAL_ROLES },
  { to: '/sales', label: 'Sales', icon: ShoppingCart, roles: OPERATIONAL_ROLES },
  { to: '/expenses', label: 'Expenses', icon: Receipt, roles: OPERATIONAL_ROLES },
  { to: '/workers', label: 'Workers', icon: Users, roles: OPERATIONAL_ROLES },
  { to: '/customers', label: 'Customers', icon: Contact, roles: ALL_ROLES },
];

const reportLinks = [
  { to: '/reports', label: 'Reports', icon: FileBarChart, roles: OVERSIGHT_ROLES },
  { to: '/analytics', label: 'Analytics', icon: LineChart, roles: OVERSIGHT_ROLES },
];

const systemLinks = [
  { to: '/investor-view', label: 'Investor View', icon: Eye, roles: OVERSIGHT_ROLES },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ALL_ROLES },
];

const adminLinks = [
  { to: '/admin', label: 'Admin', icon: ShieldCheck, roles: ['admin'] },
];

function NavSection({ title, links, userRole, onNavigate }) {
  const visibleLinks = links.filter((link) => link.roles.includes(userRole));
  if (visibleLinks.length === 0) return null;

  return (
    <div className="mb-6">
      {title && (
        <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          {title}
        </p>
      )}
      {visibleLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-green-700 text-white'
                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
            }`
          }
        >
          <Icon size={17} />
          {label}
        </NavLink>
      ))}
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'manager';

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 flex-shrink-0 h-screen flex flex-col fixed lg:sticky top-0 z-50 transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ backgroundColor: '#0a0f0c' }}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="BrumeAgri" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-extrabold text-white text-base">
              Brume<span style={{ color: '#86efac' }}>Agri</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pt-2">
          <NavSection links={workspaceLinks} userRole={role} onNavigate={onClose} />
        <NavSection title="Reports" links={reportLinks} userRole={role} onNavigate={onClose} />
        <NavSection title="System" links={systemLinks} userRole={role} onNavigate={onClose} />
        <NavSection title="Admin Only" links={adminLinks} userRole={role} onNavigate={onClose} />
        </nav>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-neutral-800">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#15803d' }}
          >
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-neutral-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;