import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Plus, Edit3, Trash2 } from "lucide-react";
import { getAdminJobs, deleteAdminJob } from "../../services/api";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, applications: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getAdminJobs();
      setJobs(response.data.jobs || []);
      setStats(response.data.stats || { total: 0, open: 0, closed: 0, applications: 0 });
    } catch (err) {
      setError("Unable to load recruiter data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteAdminJob(jobId);
    fetchJobs();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-amber-300/70">Recruiter Panel</p>
            <h1 className="text-4xl font-semibold mt-2">Hi {admin?.name || "Recruiter"}</h1>
            <p className="text-slate-400 mt-1">Own the full job lifecycle from a single glass dashboard.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/jobs/new")}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-slate-950 font-semibold hover:bg-amber-300"
            >
              <Plus className="w-4 h-4" /> New role
            </button>
            <button
              onClick={logout}
              className="rounded-2xl border border-white/20 px-5 py-3 text-sm text-white/80 hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            { label: "Total Roles", value: stats.total, tone: "from-indigo-500/30" },
            { label: "Open", value: stats.open, tone: "from-emerald-500/30" },
            { label: "Closed", value: stats.closed, tone: "from-rose-500/30" },
            { label: "Applications", value: stats.applications, tone: "from-amber-400/30" }
          ].map((card) => (
            <div
              key={card.label}
              className={`bg-gradient-to-br ${card.tone} via-slate-900 to-slate-900 rounded-3xl border border-white/10 px-5 py-6 shadow-2xl`}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">{card.label}</p>
              <p className="text-3xl font-semibold mt-2">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold">Active roles</h2>
              <p className="text-sm text-white/60">Jobs sync to the public seeker feed instantly.</p>
            </div>
            <Link to="/admin/jobs/new" className="text-sm text-amber-300 hover:text-amber-200">
              Create posting 
            </Link>
          </div>

          {error && <p className="px-6 py-3 text-rose-300 text-sm">{error}</p>}

          {loading ? (
            <div className="px-6 py-16 text-center text-white/60">Loading...</div>
          ) : jobs.length === 0 ? (
            <div className="px-6 py-16 text-center text-white/60">No recruiter-created jobs yet. Draft one to start collecting applicants.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Role</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Applicants</th>
                    <th className="text-left px-6 py-3 font-medium">Last Activity</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-t border-white/10">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{job.title}</p>
                        <p className="text-xs text-white/50">{job.company}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            job.status === "Open" ? "bg-emerald-500/20 text-emerald-200" : "bg-white/10 text-white/60"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/80">{job.applicants || 0}</td>
                      <td className="px-6 py-4 text-white/60 text-xs">
                        {job.lastApplicationAt ? new Date(job.lastApplicationAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/jobs/${job.id}/applications`)}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>
                          <button
                            onClick={() => navigate(`/admin/jobs/${job.id}/edit`, { state: { job } })}
                            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                          >
                            <Edit3 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-3 py-1 text-xs text-rose-100 hover:bg-rose-500/30"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
