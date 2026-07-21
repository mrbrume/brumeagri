import { Link } from 'react-router-dom';
import { MapPin, Sprout, Receipt, LineChart, ShieldCheck, ArrowRight } from 'lucide-react';

const FEATURES = [
  { icon: MapPin, title: 'Farm Management', desc: 'Track every farm, plot, and crop cycle in one place with location and manager details.' },
  { icon: Sprout, title: 'Inventory Tracking', desc: 'Monitor seeds, fertilizer, chemicals, and equipment with low-stock alerts.' },
  { icon: Receipt, title: 'Sales Management', desc: 'Record sales, generate invoices, and manage customer accounts effortlessly.' },
  { icon: Receipt, title: 'Expense Tracking', desc: 'Categorize expenses from salaries to logistics and see where money goes.' },
  { icon: LineChart, title: 'Analytics', desc: "Beautiful charts on productivity, profitability, and crop performance." },
  { icon: ShieldCheck, title: 'Remote Monitoring', desc: 'Investors abroad get transparent, real-time visibility into farm operations.' },
];

const ROLES = [
  { title: 'Farm Owner / Investor', desc: 'Monitor performance remotely. View sales, expenses, inventory and reports at a glance.' },
  { title: 'Farm Manager', desc: 'Record daily activities, update inventory, manage workers and log sales in seconds.' },
  { title: 'Admin', desc: 'Manage users, farms, and system-wide analytics with full control.' },
];

const TESTIMONIALS = [
  { quote: 'BrumeAgri replaced three notebooks and a WhatsApp group. I finally know what my farm is really earning.', name: 'Adaeze Okafor', role: 'Farm Owner, Enugu' },
  { quote: 'Recording sales and inventory takes seconds. My reports to the owner are automatic now.', name: 'Ibrahim Bello', role: 'Farm Manager, Kaduna' },
  { quote: 'I invest in two farms back home. BrumeAgri gives me the trust and transparency I need to keep funding.', name: 'Chinedu Umeh', role: 'Investor, London' },
];

function Navbar() {
  return (
    <div className="flex items-center justify-between px-8 lg:px-16 py-5">
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="BrumeAgri" className="w-9 h-9 rounded-lg" />
        <span className="font-display font-extrabold text-lg text-neutral-900">
          Brume<span style={{ color: '#15803d' }}>Agri</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
        <a href="#features" className="hover:text-neutral-900 transition">Features</a>
        <a href="#solution" className="hover:text-neutral-900 transition">Solution</a>
        <a href="#customers" className="hover:text-neutral-900 transition">Customers</a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition">
          Sign in
        </Link>
        <Link
          to="/register"
          className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ backgroundColor: '#15803d' }}
        >
          Get started
        </Link>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div style={{ backgroundColor: '#FAFAF7' }}>
      <Navbar />

      {/* Hero */}
      <div className="px-8 lg:px-16 pt-8 pb-20 text-center">
        
        <h1 className="font-display font-extrabold text-4xl md:text-6xl text-neutral-900 leading-tight max-w-4xl mx-auto">
          Manage your farm. Monitor your business.<br />
          <span style={{ color: '#15803d' }}>Grow with confidence.</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-2xl mx-auto mt-6">
          BrumeAgri gives farmers, managers, and investors one clear view of every activity, sale, and expense — from the field to the balance sheet.
        </p>
        <div className="flex items-center justify-center gap-4 mt-9">
          <Link
            to="/register"
            className="flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl transition hover:opacity-90"
            style={{ backgroundColor: '#15803d', boxShadow: '0 8px 20px -6px rgba(21,128,61,0.5)' }}
          >
            Start Managing Your Farm <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="text-neutral-700 font-semibold px-6 py-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition"
          >
            View live demo
          </Link>
        </div>
        <p className="text-xs text-neutral-400 mt-4">No credit card required · Works on any phone</p>

        {/* Dashboard preview mockup */}
        <div className="mt-14 max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden text-left flex">
          <div className="w-40 flex-shrink-0 p-4" style={{ backgroundColor: '#0a0f0c' }}>
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="BrumeAgri" className="w-6 h-6 rounded" />
              <span className="font-display font-bold text-white text-xs">BrumeAgri</span>
            </div>
            {['Dashboard', 'Farms', 'Crops', 'Inventory', 'Sales', 'Reports'].map((item, i) => (
              <p key={item} className={`text-xs py-2 px-2 rounded-lg mb-1 ${i === 0 ? 'text-white font-semibold' : 'text-neutral-400'}`}
                style={i === 0 ? { backgroundColor: '#15803d' } : {}}>
                {item}
              </p>
            ))}
          </div>
          <div className="flex-1 p-6">
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="border border-neutral-100 rounded-xl p-3">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Revenue</p>
                <p className="font-display font-bold text-neutral-900">₦4.82M</p>
              </div>
              <div className="border border-neutral-100 rounded-xl p-3">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Expenses</p>
                <p className="font-display font-bold text-neutral-900">₦1.61M</p>
              </div>
              <div className="border border-neutral-100 rounded-xl p-3">
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">Profit</p>
                <p className="font-display font-bold" style={{ color: '#15803d' }}>₦3.21M</p>
              </div>
            </div>
            <div className="border border-neutral-100 rounded-xl p-3 h-24 flex items-end">
              <svg viewBox="0 0 200 50" className="w-full h-full">
                <polyline points="0,40 40,32 80,28 120,20 160,14 200,8" fill="none" stroke="#15803d" strokeWidth="2" />
                <polyline points="0,45 40,42 80,40 120,37 160,35 200,33" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Problem / Solution */}
      <div id="solution" className="px-8 lg:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#15803d' }}>The Problem</span>
          <h2 className="font-display font-extrabold text-3xl text-neutral-900 mt-2 mb-4">
            Notebooks and memory don't scale a farm business.
          </h2>
          <p className="text-neutral-500 mb-5">
            Many farms still depend on paper records, WhatsApp updates, and mental math. It becomes nearly impossible to track sales, control expenses, manage inventory, or give investors an honest picture of performance.
          </p>
          <ul className="space-y-2 text-sm text-neutral-600">
            {['Lost or inconsistent daily records', 'No visibility into profit per crop', 'Investors kept in the dark', 'Stockouts of critical inputs'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#15803d' }}>The BrumeAgri Solution</span>
          <h2 className="font-display font-extrabold text-3xl text-neutral-900 mt-2 mb-4">
            One digital hub for every farm operation.
          </h2>
          <p className="text-neutral-500 mb-5">
            BrumeAgri replaces scattered records with structured digital workflows built for how farms actually operate — simple for the manager on the ground, powerful for the owner or investor.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {['Real-time dashboards', 'Role-based access', 'Automated reports', 'Mobile-first UI', 'Multi-farm support', 'Investor transparency'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-neutral-700 border border-neutral-200 rounded-xl px-3 py-2.5">
                <span style={{ color: '#15803d' }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="px-8 lg:px-16 py-20" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#15803d' }}>Features</span>
          <h2 className="font-display font-extrabold text-3xl text-neutral-900 mt-2">Everything a modern farm needs.</h2>
          <p className="text-neutral-500 mt-2">From day-to-day recording to executive analytics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#f0fdf4' }}>
                <Icon size={20} style={{ color: '#15803d' }} />
              </div>
              <h3 className="font-display font-bold text-neutral-900 mb-1.5">{title}</h3>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mt-16 mb-10">
          <h2 className="font-display font-extrabold text-3xl text-neutral-900">Built for every role on the farm.</h2>
          <p className="text-neutral-500 mt-2">Tailored dashboards for owners, managers, and administrators.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {ROLES.map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h3 className="font-display font-bold text-neutral-900 mb-1.5">{title}</h3>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div id="customers" className="px-8 lg:px-16 py-20" style={{ backgroundColor: '#052e16' }}>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#86efac' }}>Testimonials</span>
        <h2 className="font-display font-extrabold text-3xl text-white mt-2 mb-10">Trusted by farms across Nigeria.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div key={name} className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <div className="text-2xl mb-3" style={{ color: '#86efac' }}>"</div>
              <p className="text-white text-sm mb-5">{quote}</p>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-xs" style={{ color: '#86efac' }}>{role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-8 lg:px-16 py-16">
        <div
          className="rounded-2xl p-12 text-center max-w-4xl mx-auto"
          style={{ backgroundColor: '#15803d' }}
        >
          <h2 className="font-display font-extrabold text-3xl text-white mb-3">Start managing your farm today.</h2>
          <p className="text-green-100 mb-7">Join farms already using BrumeAgri to run more transparent, profitable operations.</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white font-semibold px-6 py-3.5 rounded-xl transition hover:opacity-90"
            style={{ color: '#15803d' }}
          >
            Start Managing Your Farm <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Footer */}
     <div className="px-8 lg:px-16 py-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="BrumeAgri" className="w-6 h-6 rounded" />
          <span className="font-display font-bold text-sm text-neutral-900">
            Brume<span style={{ color: '#15803d' }}>Agri</span>
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-neutral-500">
          <Link to="/legal" className="hover:text-neutral-900">Legal</Link>
          <Link to="/contact" className="hover:text-neutral-900">Contact</Link>
        </div>
       <p className="text-xs text-neutral-400">© 2026 BrumeAgri. A Brume product.</p>
      </div>
    </div>
  );
}

export default Landing;