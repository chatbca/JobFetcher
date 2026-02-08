import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(credentials.email, credentials.password);
      navigate('/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      email: 'test@gmail.com',
      password: 'test@123',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--navy-900)' }}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-orange-500 p-3 rounded-xl mb-4 shadow-lg shadow-orange-500/20">
            <Briefcase className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">JobTracker AI</h1>
          <p className="text-slate-400 mt-2 font-medium">AI-Powered Job Search & Tracking</p>
        </div>

        {/* Login Form */}
        <div className="clay-card p-8 border-navy-700/50">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="filter-input"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder=""
                required
                className="filter-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary flex items-center justify-center gap-2 mt-2 h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Account */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wider mb-4">
              Quick access
            </p>
            <button
              onClick={handleDemoLogin}
              className="w-full btn btn-secondary flex items-center justify-center h-11"
            >
              Use Demo Credentials
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
              Email: <span className="text-slate-500">test@gmail.com</span> | Password: <span className="text-slate-500">test@123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-slate-500">
            Built with LangChain & LangGraph for AI-powered matching
          </p>
          <a
            href="https://jobbackend-o5tj.onrender.com/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-slate-700 hover:text-slate-600 transition-colors uppercase tracking-widest font-bold"
          >
            System Status
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
