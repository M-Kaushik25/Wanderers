import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUser, signupUser } from '../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<'TOURIST' | 'OPERATOR'>('TOURIST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let data;
      if (isSignup) {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        data = await signupUser({ name, email, password, role });
      } else {
        data = await loginUser({ email, password });
      }

      // Store token & user data
      if (data.token) {
        localStorage.setItem('wanderers_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('wanderers_user', JSON.stringify(data.user));
      }

      // Navigate to packages page or home page
      navigate('/packages');
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">
            {isSignup ? 'Create an Account' : 'Welcome back'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-1">
            {isSignup ? 'Join Wanderers to explore & book tours' : 'Enter your details to access your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Account Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-3">
                  <button
                    type="button"
                    onClick={() => setRole('TOURIST')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      role === 'TOURIST'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Tourist
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('OPERATOR')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      role === 'OPERATOR'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Tour Operator
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignup(false); setError(null); }}
                className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignup(true); setError(null); }}
                className="text-blue-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
