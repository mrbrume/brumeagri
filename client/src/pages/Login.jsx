import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({ email, password });
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

          <div className="flex-1 flex items-center justify-center px-10">
            <div className="w-full max-w-sm">
              <h1 className="font-display font-extrabold text-3xl text-neutral-900 mb-2 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-neutral-500 mb-8">
                Sign in to keep track of your farm's numbers.
              </p>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Password
                    </label>
                    <a href="#" className="text-xs font-semibold hover:underline" style={{ color: '#15803d' }}>
                      Forgot?
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-white focus:outline-none text-sm transition"
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(21,128,61,0.25)'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-bold py-3 rounded-xl transition disabled:opacity-60 hover:opacity-90"
                  style={{ backgroundColor: '#15803d', boxShadow: '0 6px 16px -6px rgba(21,128,61,0.5)' }}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>

                <button
                  type="button"
                  className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold py-3 rounded-xl transition text-sm"
                >
                  Continue with Google
                </button>
              </form>

              <p className="text-center text-sm text-neutral-500 mt-7">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold hover:underline" style={{ color: '#15803d' }}>
                  Create one
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
              The clarity BrumeAgri gives me over my farm — from Lagos — is the reason I keep investing.
            </p>
            <p className="text-white font-semibold text-base">Chinedu Umeh</p>
            <p className="text-sm" style={{ color: '#86efac' }}>Agricultural Investor</p>
          </div>
        </div>
      </div>

      <div className="h-1.5" style={{ backgroundColor: '#15803d' }}></div>
    </div>
  );
}

export default Login;