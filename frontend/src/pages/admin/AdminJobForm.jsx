import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createAdminJob, updateAdminJob, getAdminJobById } from "../../services/api";

const defaultForm = {
  title: "",
  company: "",
  location: "Remote",
  description: "",
  skills: "",
  jobType: "Full-time",
  workMode: "Remote",
  experienceLevel: "Mid",
  applyLink: "",
  status: "Open"
};

const AdminJobForm = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJob = async () => {
      try {
        const response = await getAdminJobById(jobId);
        const job = response.data.job;
        setForm({
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          skills: (job.skills || []).join(", "),
          jobType: job.jobType,
          workMode: job.workMode,
          experienceLevel: job.experienceLevel,
          applyLink: job.applyLink || "",
          status: job.status
        });
      } catch (err) {
        setError("Unable to load job details");
      } finally {
        setInitializing(false);
      }
    };

    if (isEdit) {
      loadJob();
    }
  }, [isEdit, jobId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...form, skills: form.skills };
      if (isEdit) {
        await updateAdminJob(jobId, payload);
      } else {
        await createAdminJob(payload);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save job");
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">{isEdit ? "Update role" : "Create role"}</p>
              <h1 className="text-3xl font-semibold mt-2">{isEdit ? "Edit job" : "New opening"}</h1>
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-rose-300">{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Job Title</label>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Apply Link</label>
                <input
                  value={form.applyLink}
                  onChange={(e) => handleChange("applyLink", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Required Skills (comma separated)</label>
              <input
                value={form.skills}
                onChange={(e) => handleChange("skills", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm text-white/70">Job Type</label>
                <select
                  value={form.jobType}
                  onChange={(e) => handleChange("jobType", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                >
                  {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                    <option key={type} value={type} className="bg-slate-900 text-white">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70">Work Mode</label>
                <select
                  value={form.workMode}
                  onChange={(e) => handleChange("workMode", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                >
                  {["Remote", "Hybrid", "On-site"].map((mode) => (
                    <option key={mode} value={mode} className="bg-slate-900 text-white">
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-white/70">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => handleChange("experienceLevel", e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
                >
                  {["Junior", "Mid", "Senior", "Lead"].map((level) => (
                    <option key={level} value={level} className="bg-slate-900 text-white">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="mt-2 w-full rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-white"
              >
                {["Open", "Closed"].map((status) => (
                  <option key={status} value={status} className="bg-slate-900 text-white">
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-amber-400 py-3 text-slate-900 font-semibold hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isEdit ? "Update role" : "Publish role"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminJobForm;
