import React from 'react';
import { LogIn } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

export default function Login() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.code || '';
      if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add it to Authentication > Settings > Authorized domains.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by the browser. Please allow pop-ups for this site.');
      } else {
        setError(`Sign-in failed: ${err?.message || 'Unknown error'}. Code: ${code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-natural-border overflow-hidden text-center p-12">
        <div className="w-20 h-20 bg-natural-primary rounded-xl flex items-center justify-center font-bold text-white text-4xl mx-auto mb-8 shadow-lg shadow-natural-primary/20">
          EF
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-natural-text mb-2">Eden Fresh</h1>
        <p className="text-natural-text/60 mb-10">Smart POS & Accounting for Meat Shops</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-natural-text text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn size={20} />
          )}
          Sign in with Google
        </button>
        
        <p className="mt-8 text-xs text-gray-400">
          Restricted access. Only authorized shop staff can sign in.
        </p>
      </div>
    </div>
  );
}
