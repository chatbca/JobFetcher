import React from 'react';
import { X, Filter } from 'lucide-react';

const Filters = ({ filters, onFilterChange, onClear, activeCount = 0 }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const workModes = ['Remote', 'Hybrid', 'On-site'];
  const dateOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
  ];
  const matchScoreOptions = [
    { value: 'high', label: 'High Match (>70%)' },
    { value: 'medium', label: 'Good Match (40-70%)' },
    { value: 'all', label: 'All Matches' },
  ];

  const commonSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
    'PostgreSQL', 'Vue.js', 'Angular', 'Django', 'FastAPI',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Go', 'Rust'
  ];

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    onFilterChange('skills', newSkills);
  };

  return (
    <div className="filters">
      <div className="filters-header">
        <div>
          <h2 className="filters-title">
            <Filter className="w-5 h-5" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }} />
            Filters
          </h2>
          {activeCount > 0 && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--orange-500)', fontWeight: 600, marginLeft: '0.5rem' }}>
              ({activeCount} active)
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onClear} className="btn-ghost" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}>
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="filter-group">
        <label className="filter-label">Search Role</label>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => onFilterChange('query', e.target.value)}
          placeholder="e.g. Senior React Developer"
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Skills</label>
        <div className="filter-chips" style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {commonSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`filter-chip ${(filters.skills || []).includes(skill) ? 'active' : ''}`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Match Score</label>
        <select
          value={filters.matchScore || 'all'}
          onChange={(e) => onFilterChange('matchScore', e.target.value)}
          className="filter-input"
        >
          {matchScoreOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Job Type</label>
        <div className="filter-chips">
          <button
            onClick={() => onFilterChange('jobType', '')}
            className={`filter-chip ${!filters.jobType ? 'active' : ''}`}
          >
            All Types
          </button>
          {jobTypes.map((type) => (
            <button
              key={type}
              onClick={() => onFilterChange('jobType', type)}
              className={`filter-chip ${filters.jobType === type ? 'active' : ''}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Work Mode</label>
        <div className="filter-chips">
          <button
            onClick={() => onFilterChange('workMode', '')}
            className={`filter-chip ${!filters.workMode ? 'active' : ''}`}
          >
            All Modes
          </button>
          {workModes.map((mode) => (
            <button
              key={mode}
              onClick={() => onFilterChange('workMode', mode)}
              className={`filter-chip ${filters.workMode === mode ? 'active' : ''}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">Location</label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="e.g. San Francisco, Remote"
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">Date Posted</label>
        <select
          value={filters.datePosted || ''}
          onChange={(e) => onFilterChange('datePosted', e.target.value)}
          className="filter-input"
        >
          <option value="">Any time</option>
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
