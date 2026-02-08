import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, AlertCircle, Sparkles, SlidersHorizontal, X, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Filters from '../components/Filters';
import JobCard from '../components/JobCard';
import AIAssistant from '../components/AIAssistant';
import ApplyPopup from '../components/ApplyPopup';
import { getJobs, getResumeStatus } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [hasResume, setHasResume] = useState(false);
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const fetchJobs = useCallback(async (overrideFilters = null) => {
    const activeFilters = overrideFilters ?? filtersRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getJobs(activeFilters);
      const jobsArray = response.data?.jobs ?? [];
      setJobs(jobsArray);

      const sortedByMatch = [...jobsArray]
        .filter((job) => job.matchScore && job.matchScore > 70)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 8);

      setBestMatches(sortedByMatch);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchResumeStatus = useCallback(async () => {
    try {
      const response = await getResumeStatus();
      const status = Boolean(response.data?.hasResume);
      setHasResume(status);
      return status;
    } catch (err) {
      console.error('Failed to load resume status:', err);
      setHasResume(false);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchResumeStatus();
  }, [fetchJobs, fetchResumeStatus]);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  useEffect(() => {
    const handleResumeEvent = () => {
      setHasResume(true);
      fetchJobs();
    };

    window.addEventListener('resume-status-change', handleResumeEvent);
    return () => window.removeEventListener('resume-status-change', handleResumeEvent);
  }, [fetchJobs]);

  const applyFilters = () => {
    let filtered = [...jobs];

    if (filters.matchScore === 'high') {
      filtered = filtered.filter((job) => job.matchScore && job.matchScore > 70);
    } else if (filters.matchScore === 'medium') {
      filtered = filtered.filter(
        (job) => job.matchScore && job.matchScore >= 40 && job.matchScore <= 70
      );
    }

    if (filters.skills?.length) {
      filtered = filtered.filter((job) => {
        if (!job.skills) return false;
        return filters.skills.every((skill) => job.skills.includes(skill));
      });
    }

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.company?.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchJobs({});
  };

  const handleAIFilterUpdate = (newFilters) => {
    const mergedFilters = { ...filtersRef.current, ...newFilters };
    setFilters((prev) => ({ ...prev, ...newFilters }));
    fetchJobs(mergedFilters);
    setFilterSheetOpen(false);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
  };

  const handleApplySuccess = () => {
    console.log('Application saved');
  };

  const openFilterSheet = () => setFilterSheetOpen(true);
  const closeFilterSheet = () => setFilterSheetOpen(false);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([, value]) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') {
        return value.trim() !== '' && value !== 'all';
      }
      return true;
    }).length;
  }, [filters]);

  const stats = useMemo(
    () => [
      { label: 'Open Positions', value: jobs.length || 0 },
      { label: 'Top Matches', value: bestMatches.length || 0 },
      { label: 'Active Filters', value: activeFilterCount },
    ],
    [jobs.length, bestMatches.length, activeFilterCount]
  );

  const heroSubtitle = hasResume
    ? 'Your profile is analyzed. Browse AI-matched opportunities below.'
    : 'Upload your resume to unlock intelligent job matching and personalized recommendations.';

  const resultsLabel = useMemo(() => {
    if (isLoading) return 'Loading opportunities';
    if (!filteredJobs.length) return 'No positions found';
    return `${filteredJobs.length} position${filteredJobs.length === 1 ? '' : 's'}`;
  }, [isLoading, filteredJobs.length]);

  const showBestMatches = hasResume && bestMatches.length > 0 && !filters.matchScore;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
      <Header />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-header">
            <div className="hero-branding">
              <div className="hero-title-block">
                <h1>Discover Your Next Career Move</h1>
                <p>{heroSubtitle}</p>
              </div>
            </div>
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-secondary"
                style={{ background: 'rgba(255, 255, 255, 0.16)', color: 'white', border: '1.5px solid rgba(255, 255, 255, 0.3)' }}
                onClick={() => handleFilterChange('matchScore', 'high')}
              >
                <TrendingUp className="w-4 h-4" />
                Top Matches
              </button>
              <button
                type="button"
                className="btn btn-primary lg:hidden"
                onClick={openFilterSheet}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    marginLeft: '0.25rem',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="page-container">
        <aside className="sidebar">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            activeCount={activeFilterCount}
          />
        </aside>

        <main className="main-content">
          {showBestMatches && (
            <section className="best-matches">
              <div className="best-matches-header">
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '0.25rem', fontWeight: 600 }}>
                    AI Recommendations
                  </p>
                  <h2 className="best-matches-title">
                    <Sparkles className="w-6 h-6" style={{ color: 'var(--orange-500)' }} />
                    Best Matches For You
                  </h2>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleFilterChange('matchScore', 'high')}
                >
                  View All Top Matches
                </button>
              </div>
              <div className="best-matches-scroll">
                {bestMatches.map((job) => (
                  <JobCard key={job.id} job={job} onApply={() => handleApply(job)} compact />
                ))}
              </div>
            </section>
          )}

          <section>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
                  All Opportunities
                </h2>
                <p style={{ color: 'var(--slate-600)' }}>{resultsLabel}</p>
              </div>
            </div>

            {isLoading && (
              <div className="clay-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--slate-400)', margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', color: 'var(--slate-600)' }}>Loading positions...</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="clay-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertCircle className="w-6 h-6" style={{ color: 'var(--orange-500)' }} />
                <p style={{ color: 'var(--slate-700)' }}>{error}</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {filteredJobs.length === 0 ? (
                  <div style={{
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    borderRadius: '28px',
                    border: '2px dashed var(--slate-300)',
                    background: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <AlertCircle className="w-12 h-12" style={{ color: 'var(--slate-400)', margin: '0 auto 1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                      No positions match your filters
                    </h3>
                    <p style={{ color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
                      Try adjusting your search criteria or clearing filters
                    </p>
                    <button type="button" className="btn btn-primary" onClick={handleClearFilters}>
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="job-grid">
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} onApply={() => handleApply(job)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* Mobile Filter Sheet */}
      <div
        className={`modal-overlay ${isFilterSheetOpen ? '' : ''}`}
        style={{
          display: isFilterSheetOpen ? 'flex' : 'none',
          alignItems: 'flex-end',
          padding: 0
        }}
        onClick={closeFilterSheet}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '640px',
            margin: '0 auto',
            background: 'var(--color-bg-surface)',
            borderTopLeftRadius: '32px',
            borderTopRightRadius: '32px',
            padding: '1.5rem',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-clay-xl)',
            animation: isFilterSheetOpen ? 'slideUp 320ms ease' : 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', fontWeight: 600 }}>Filter Options</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>Refine Your Search</h3>
            </div>
            <button
              onClick={closeFilterSheet}
              className="btn-ghost"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            activeCount={activeFilterCount}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--slate-200)' }}>
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters} style={{ flex: 1 }}>
              Clear All
            </button>
            <button type="button" className="btn btn-primary" onClick={closeFilterSheet} style={{ flex: 1 }}>
              Show {filteredJobs.length} Results
            </button>
          </div>
        </div>
      </div>

      <AIAssistant onFilterUpdate={handleAIFilterUpdate} />

      {selectedJob && (
        <ApplyPopup
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
};

export default Jobs;
