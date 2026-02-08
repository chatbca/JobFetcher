import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Calendar, Building2, TrendingUp, Briefcase } from 'lucide-react';
import Header from '../components/Header';
import AIAssistant from '../components/AIAssistant';
import { getApplications, updateApplication } from '../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, applied, interview, offer, rejected

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getApplications();
      const data = response.data.applications || [];
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateApplication(id, { status: newStatus });
      setApplications(prev =>
        prev.map(app => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      Interview: 'bg-purple-100 text-purple-700',
      Offer: 'bg-green-100 text-green-700',
      Rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offer: applications.filter(a => a.status === 'Offer').length,
  };

  const formatTimelineActor = (actor = '') => {
    if (actor === 'candidate') return 'You';
    if (actor === 'recruiter') return 'Recruiter';
    if (actor === 'system') return 'System';
    if (!actor) return 'System';
    return actor.charAt(0).toUpperCase() + actor.slice(1);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-600">Track and manage your job applications</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="clay-card p-4 md:p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Total</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">{stats.total}</p>
              </div>
              <div className="bg-orange-50 p-2 md:p-3 rounded-xl text-orange-500 flex-shrink-0">
                <TrendingUp className="w-6 h-6 md:w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="clay-card p-4 md:p-6 border-l-4 border-amber-400">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Applied</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">{stats.applied}</p>
              </div>
              <div className="bg-amber-50 p-2 md:p-3 rounded-xl text-amber-500 flex-shrink-0">
                <Calendar className="w-6 h-6 md:w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="clay-card p-4 md:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Interviews</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">{stats.interview}</p>
              </div>
              <div className="bg-purple-50 p-2 md:p-3 rounded-xl text-purple-500 flex-shrink-0">
                <Building2 className="w-6 h-6 md:w-8 h-8" />
              </div>
            </div>
          </div>
          <div className="clay-card p-4 md:p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Offers</p>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-0.5">{stats.offer}</p>
              </div>
              <div className="bg-teal-50 p-2 md:p-3 rounded-xl text-teal-500 flex-shrink-0">
                <TrendingUp className="w-6 h-6 md:w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="clay-card mb-8">
          <div className="flex gap-2 p-3 overflow-x-auto hide-scrollbar">
            {['all', 'applied', 'interview', 'offer', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2.5 rounded-xl font-bold transition-all duration-200 capitalize whitespace-nowrap ${filter === status
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 translate-y-[-1px]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 clay-card">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-900">No applications found</p>
            <p className="text-slate-500 mt-2">Start applying to jobs to track them here!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="clay-card p-6 md:p-8 hover:translate-y-[-2px] transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex-1 min-w-0 w-full">
                    <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2 truncate">{app.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-navy-500" />
                        <span className="text-slate-700 truncate max-w-[150px] md:max-w-none">{app.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-navy-500" />
                        <span className="whitespace-nowrap">Applied: {new Date(app.appliedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${getStatusColor(app.status)}`}>
                    {app.status}
                  </div>
                </div>

                {app.notes && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100 italic">
                    <p className="text-sm text-slate-600">"{app.notes}"</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t border-slate-100">
                  {/* Status Update */}
                  <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Quick Update:</label>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all cursor-pointer min-w-[140px]"
                    >
                      <option value="Applied">Applied</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Tiny Match Indicator if present */}
                  {app.matchScore > 0 && (
                    <div className="flex items-center gap-2 text-sm font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                      <TrendingUp className="w-4 h-4" />
                      Match Strength: {app.matchScore}%
                    </div>
                  )}
                </div>

                {app.timeline && app.timeline.length > 0 && (
                  <div className="mt-8 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      Application Journey
                    </p>
                    <ol className="relative ml-3 border-l-2 border-slate-200 pl-6 space-y-5">
                      {app.timeline.map((event, index) => (
                        <li key={`${app.id}-event-${index}`} className="relative">
                          <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-teal-500 shadow-sm"></span>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{event.status}</p>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                              {new Date(event.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })} &middot; {formatTimelineActor(event.actor)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <AIAssistant />
    </div>
  );
};

export default Applications;
