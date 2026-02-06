import React from 'react';
import { X } from 'lucide-react';

const Filters = ({ filters, onFilterChange, onClear }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const workModes = ['Remote', 'Hybrid', 'On-site'];
  const dateOptions = [
    { value: '24h', label: 'Last 24 hours' },
    { value: 'week', label: 'Last week' },
    { value: 'month', label: 'Last month' },
  ];
  const matchScoreOptions = [
    { value: 'high', label: 'High (>70%)' },
    { value: 'medium', label: 'Medium (40-70%)' },
    { value: 'all', label: 'All' },
  ];

  const commonSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'Java', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
    'PostgreSQL', 'Vue.js', 'Angular', 'Django', 'FastAPI',
    'Machine Learning', 'TensorFlow', 'PyTorch'
  ];

  const handleSkillToggle = (skill) => {
    const currentSkills = filters.skills || [];
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    onFilterChange('skills', newSkills);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Search Query */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role / Title
        </label>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => onFilterChange('query', e.target.value)}
          placeholder="e.g. React Developer"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Skills */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {commonSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                (filters.skills || []).includes(skill)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Posted
        </label>
        <select
          value={filters.datePosted || ''}
          onChange={(e) => onFilterChange('datePosted', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Any time</option>
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Type
        </label>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type}
                onChange={() => onFilterChange('jobType', type)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{type}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="jobType"
              checked={!filters.jobType}
              onChange={() => onFilterChange('jobType', '')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">All</span>
          </label>
        </div>
      </div>

      {/* Work Mode */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Work Mode
        </label>
        <div className="space-y-2">
          {workModes.map((mode) => (
            <label key={mode} className="flex items-center">
              <input
                type="radio"
                name="workMode"
                checked={filters.workMode === mode}
                onChange={() => onFilterChange('workMode', mode)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{mode}</span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="workMode"
              checked={!filters.workMode}
              onChange={() => onFilterChange('workMode', '')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">All</span>
          </label>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="e.g. San Francisco"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Match Score */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Match Score
        </label>
        <select
          value={filters.matchScore || 'all'}
          onChange={(e) => onFilterChange('matchScore', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {matchScoreOptions.map((option) => (
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
