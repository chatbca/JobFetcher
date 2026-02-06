import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Star, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import Filters from '../components/Filters';
import JobCard from '../components/JobCard';
import AIAssistant from '../components/AIAssistant';
import ApplyPopup from '../components/ApplyPopup';
import { getJobs } from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [bestMatches, setBestMatches] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, jobs]);

  const fetchJobs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getJobs(filters);
      const data = response.data;
      
      const jobsArray = data.jobs || [];
      setJobs(jobsArray);
      
      // Calculate best matches (top 6-8 jobs with match score > 70%)
      const sortedByMatch = [...jobsArray]
        .filter(job => job.matchScore && job.matchScore > 70)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 8);
      
      setBestMatches(sortedByMatch);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Apply match score filter
    if (filters.matchScore === 'high') {
      filtered = filtered.filter(job => job.matchScore && job.matchScore > 70);
    } else if (filters.matchScore === 'medium') {
      filtered = filtered.filter(job => job.matchScore && job.matchScore >= 40 && job.matchScore <= 70);
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({});
    fetchJobs();
  };

  const handleAIFilterUpdate = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    fetchJobsWithFilters(newFilters);
  };

  const fetchJobsWithFilters = async (newFilters) => {
    setIsLoading(true);
    try {
      const response = await getJobs(newFilters);
      const data = response.data;
      const jobsArray = data.jobs || [];
      setJobs(jobsArray);
      
      // Recalculate best matches
      const sortedByMatch = [...jobsArray]
        .filter(job => job.matchScore && job.matchScore > 70)
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
        .slice(0, 8);
      
      setBestMatches(sortedByMatch);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
  };

  const handleApplySuccess = () => {
    console.log('Application saved');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-80 flex-shrink-0">
            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <>
                {/* Best Matches Section */}
                {bestMatches.length > 0 && !filters.matchScore && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg p-6 text-white">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-lg p-2">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">Best Matches for You</h2>
                          <p className="text-blue-100 text-sm mt-1">
                            Top {bestMatches.length} jobs with 70%+ match score based on your resume
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border-x-2 border-b-2 border-blue-600 rounded-b-lg p-4 shadow-lg">
                      <div className="grid gap-4">
                        {bestMatches.map((job) => (
                          <div key={job.id} className="border-l-4 border-green-500 bg-green-50/50 rounded-lg">
                            <JobCard job={job} onApply={() => handleApply(job)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* All Jobs Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {filters.matchScore ? ' Filtered Jobs' : ' All Jobs'}
                    </h2>
                    <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                    </p>
                  </div>

                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg mb-2">No jobs found matching your criteria</p>
                      <button
                        onClick={handleClearFilters}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job} onApply={() => handleApply(job)} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant onFilterUpdate={handleAIFilterUpdate} />

      {/* Apply Popup */}
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