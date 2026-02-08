import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to login. Check the credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: "admin@company.com", password: "admin@123" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-amber-400/20 to-pink-500/10 border border-white/10 rounded-3xl p-10 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-white mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Recruiter Console</p>
              <h2 className="text-3xl font-semibold">Job Lifecycle Control</h2>
            </div>
          </div>
          <ul className="space-y-4 text-white/80 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-400"></span>
              Post authentic roles with a tailored hiring workflow.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-pink-400"></span>
              Track candidates through Applied  Shortlisted  Interview  Offer.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-400"></span>
              Harness AI signals to rank applicants by match score.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Secure Access</p>
              <h1 className="text-2xl font-bold text-slate-900">Recruiter Login</h1>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                placeholder="admin@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                placeholder=""
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 text-white py-3 font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                </>
              ) : (
                "Enter Admin Console"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400 mb-3">Demo Credentials</p>
            <button
              onClick={fillDemo}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-500"
            >
              Autofill admin@company.com / admin@123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
