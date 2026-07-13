import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Copy, Check, AlertCircle } from 'lucide-react';
import RebrandTool from '../components/admin/RebrandTool';
import { brand } from '../config/brand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function Rebrand() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');

  // Load auth status on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('rebrand_auth');
    const pass = sessionStorage.getItem('rebrand_password');
    if (auth === 'true' && pass) {
      setPassword(pass);
      setIsAuthenticated(true);
    }
  }, []);

  const showToastMsg = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const correctPassword = 'rebrand@2024';

    if (inputPassword === correctPassword) {
      setIsAuthenticated(true);
      setPassword(inputPassword);
      sessionStorage.setItem('rebrand_auth', 'true');
      sessionStorage.setItem('rebrand_password', inputPassword);
      setInputPassword('');
      showToastMsg('Authentication successful!', 'success');
    } else {
      setError('Invalid password');
      setInputPassword('');
      showToastMsg('Invalid password', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">Rebrand Tool</h1>
            <p className="text-sm text-slate-400 text-center mb-6">
              10-minute client rebranding system. Enter your access password to continue.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Access Password</label>
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
                {error && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 bg-red-500/15 border border-red-500/30 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-300" />
                    <span className="text-sm text-red-300">{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Access Rebrand Tool
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                {brand.brand_name} - Rebrand Access
              </p>
            </div>
          </div>
        </div>

        {/* Toast notifications */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}
            >
              {toast.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sessionStorage.removeItem('rebrand_auth');
                sessionStorage.removeItem('rebrand_password');
                window.location.href = '/';
              }}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{brand.brand_name} - Rebrand Tool</h1>
              <p className="text-xs text-slate-400">10-minute rebrand for any client</p>
            </div>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem('rebrand_auth');
              sessionStorage.removeItem('rebrand_password');
              setIsAuthenticated(false);
            }}
            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <RebrandTool showToast={showToastMsg} />
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
