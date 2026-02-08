import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, FileText, Loader2 } from "lucide-react";
import { getAdminJobApplications, updateAdminApplicationStatus } from "../../services/api";

const statusOptions = ["Applied", "Shortlisted", "Interview", "Offer", "Hired", "Rejected"];

const AdminApplications = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await getAdminJobApplications(jobId);
      setJob(response.data.job || null);
      setApplications(response.data.applications || []);
    } catch (err) {
      setError("Unable to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId, status) => {
    await updateAdminApplicationStatus(applicationId, status);
    setApplications((prev) => prev.map((app) => (app.id === applicationId ? { ...app, status } : app)));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mt-6 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Applicants</p>
              <h1 className="text-3xl font-semibold mt-2">{job?.title || "Job"}</h1>
              <p className="text-white/60 text-sm">{job?.company}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
              Status: {job?.status || "Open"}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-rose-300">{error}</p>}

          {loading ? (
            <div className="py-16 text-center text-white/60">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" />
              Loading candidates...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center text-white/60">No applications yet.</div>
          ) : (
            <div className="mt-8 space-y-6">
              {applications.map((application) => (
                <div key={application.id} className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/10 p-3">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold">{application.candidateName || "Candidate"}</p>
                          <p className="text-sm text-white/60">{application.candidateEmail}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-white/70">
                        Match Score: <span className="font-semibold text-amber-300">{application.matchScore ?? "N/A"}</span>
                      </p>
                    </div>

                    <div className="flex gap-3 items-center">
                      <label className="text-xs uppercase tracking-[0.4em] text-white/60">Status</label>
                      <select
                        value={application.status}
                        onChange={(event) => handleStatusChange(application.id, event.target.value)}
                        className="rounded-2xl bg-white/10 border border-white/10 px-3 py-2 text-sm"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option} className="bg-slate-900">
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {application.resumeSummary && (
                    <div className="mt-4 text-sm text-white/70 flex items-start gap-3">
                      <FileText className="w-4 h-4 text-amber-300 mt-1" />
                      <p>{application.resumeSummary}</p>
                    </div>
                  )}

                  {application.timeline && application.timeline.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Timeline</p>
                      <div className="flex flex-wrap gap-3">
                        {application.timeline.map((entry, index) => (
                          <span key={`${application.id}-${index}`} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                            {entry.status}  {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminApplications;
