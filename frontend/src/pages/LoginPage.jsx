import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/common/Logo';
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Hash,
  Crown,
  Sparkles
} from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [identifier, setIdentifier] = useState('admin@utility.com');
  const [password, setPassword] = useState('admin123');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regMeter, setRegMeter] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(identifier, password);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        address: regAddress,
        meter_number: regMeter || undefined,
        role: 'consumer',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (idVal, passVal) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#06080d] transition-colors overflow-hidden">
      {/* Luxury atmospheric champagne and gold glow lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-amber-500/10 via-yellow-400/5 to-amber-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="fixed top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-md border border-slate-200/80 dark:border-amber-500/20 text-slate-600 dark:text-amber-200 shadow-sm hover:border-amber-400/50 transition-all"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Luxury Brand Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <div className="mb-4">
          <Logo size="xl" showText={false} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-slate-900 dark:text-white uppercase">
          VOLT<span className="bg-gradient-to-r from-yellow-200 via-amber-400 to-amber-600 bg-clip-text text-transparent font-sans">GRID</span>
          <span className="ml-2 font-mono text-xs px-2.5 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-300">
            LUXE
          </span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-amber-200/60 tracking-wider uppercase font-medium max-w-sm">
          Executive Energy Management & Automated Slab Billing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl shadow-amber-950/20 dark:shadow-none border border-slate-200/80 dark:border-amber-500/20 rounded-3xl relative">
          {/* Subtle top gold foil line */}
          <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-100 dark:bg-[#131926] p-1 rounded-2xl mb-6 border border-slate-200/60 dark:border-amber-500/20">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-gradient-to-r dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-amber-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-gradient-to-r dark:from-amber-400 dark:via-yellow-400 dark:to-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-amber-200'
              }`}
            >
              Register Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  Email or Meter Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="admin@utility.com or ELEC-99201"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:from-amber-200 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-glow-gold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm tracking-wide uppercase"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Access Private Console</span>
                      <ArrowRight className="w-4 h-4 text-slate-950" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Fill Demo Credentials */}
              <div className="pt-5 border-t border-slate-100 dark:border-amber-500/15">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 dark:text-amber-200/50 uppercase tracking-[0.15em] mb-2.5">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>One-Touch Priority Access</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('admin@utility.com', 'admin123')}
                    className="p-2 text-left bg-gradient-to-br from-amber-500/5 to-yellow-500/10 hover:from-amber-500/15 hover:to-yellow-500/20 border border-amber-500/20 rounded-xl transition-all text-xs group"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-amber-500" /> Admin Staff
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      admin@utility.com
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('alex@example.com', 'consumer123')}
                    className="p-2 text-left bg-gradient-to-br from-amber-500/5 to-yellow-500/10 hover:from-amber-500/15 hover:to-yellow-500/20 border border-amber-500/20 rounded-xl transition-all text-xs group"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-500" /> Alex (Consumer)
                    </div>
                    <div className="text-[10px] text-amber-600/70 dark:text-amber-400 font-mono">
                      ELEC-99201
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('sophia@example.com', 'consumer123')}
                    className="p-2 text-left bg-gradient-to-br from-amber-500/5 to-yellow-500/10 hover:from-amber-500/15 hover:to-yellow-500/20 border border-amber-500/20 rounded-xl transition-all text-xs group"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-500" /> Sophia (Overdue)
                    </div>
                    <div className="text-[10px] text-amber-600/70 dark:text-amber-400 font-mono">
                      ELEC-44182
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoCredentials('david@example.com', 'consumer123')}
                    className="p-2 text-left bg-gradient-to-br from-amber-500/5 to-yellow-500/10 hover:from-amber-500/15 hover:to-yellow-500/20 border border-amber-500/20 rounded-xl transition-all text-xs group"
                  >
                    <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <User className="w-3 h-3 text-amber-500" /> David (Settled)
                    </div>
                    <div className="text-[10px] text-amber-600/70 dark:text-amber-400 font-mono">
                      ELEC-88319
                    </div>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" /> Password *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="Create secure password"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-500" /> Meter Identifier (Optional)
                </label>
                <input
                  type="text"
                  value={regMeter}
                  onChange={(e) => setRegMeter(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="Leave empty to auto-generate"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-[#131926] border border-slate-200 dark:border-amber-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
                  placeholder="123 Maple Street"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:from-amber-200 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-glow-gold transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <span>Register Account</span>}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
