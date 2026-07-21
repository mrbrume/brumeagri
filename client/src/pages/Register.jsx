import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'owner', label: 'Farm Owner / Investor', desc: 'Monitor performance, view reports remotely' },
  { value: 'manager', label: 'Farm Manager', desc: 'Record daily activities, manage operations' },
];

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('owner');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({ name, email, password, role });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF7' }}>
      <div className="flex-1 flex">
        {/* Left column */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex items-center justify-between px-10 py-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="BrumeAgri" className="w-9 h-9 rounded-lg" />
              <span className="font-display font-extrabold text-lg text-neutral-900">
                Brume<span style={{ color: '#15803d' }}>Agri</span>
              </span>
            </div>
            <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-neutral-800 transition">
              ← Back home
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-10 py-8">
            <div className="w-full max-w-sm">
              <h1 className="font-display font-extrabold text-3xl text-neutral-900 mb-2 tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-neutral-500 mb-7">
                Start managing your farm in minutes.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Adaeze Okafor"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none text-sm transition"
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@farm.com"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none text-sm transition"
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none text-sm transition"
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2.5">
                    I am a...
                  </label>
                  <div className="space-y-2.5">
                    {ROLES.map((r) => (
                      <label
                        key={r.value}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition"
                        style={{
                          borderColor: role === r.value ? '#15803d' : '#e5e5e5',
                          backgroundColor: role === r.value ? '#f0fdf4' : 'white',
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r.value}
                          checked={role === r.value}
                          onChange={(e) => setRole(e.target.value)}
                          className="mt-1 accent-green-700"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900 text-sm">{r.label}</p>
                          <p className="text-xs text-neutral-500">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 accent-green-700"
                  />
                  <span className="text-sm text-neutral-600">
                    I agree to the{' '}
                    <Link to="/legal" className="font-semibold hover:underline" style={{ color: '#15803d' }}>
                      Terms & Conditions and Privacy Policy
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: '#15803d', boxShadow: '0 6px 16px -6px rgba(21,128,61,0.5)' }}
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-sm text-neutral-500 mt-7">
                Already have an account?{' '}
                <Link to="/login" className="font-bold hover:underline" style={{ color: '#15803d' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right column: dark panel */}
        <div
          className="hidden lg:flex w-1/2 flex-col justify-between p-10 relative overflow-hidden"
          style={{
            backgroundColor: '#052e16',
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        >
          <span className="font-display font-bold text-sm" style={{ color: '#86efac' }}>
            BrumeAgri
          </span>

          <div className="relative z-10">
            <div className="text-4xl mb-4" style={{ color: '#86efac' }}>"</div>
            <p className="font-display font-bold text-white text-2xl leading-snug mb-6 max-w-md -mt-4">
              BrumeAgri replaced three notebooks and a WhatsApp group. I finally know what my farm is really earning.
            </p>
            <p className="text-white font-semibold text-base">Adaeze Okafor</p>
            <p className="text-sm" style={{ color: '#86efac' }}>Farm Owner, Enugu</p>
          </div>
        </div>
      </div>

      <div className="h-1.5" style={{ backgroundColor: '#15803d' }}></div>
    </div>
  );
}

export default Register;