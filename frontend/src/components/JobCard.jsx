import React from 'react';
import { MapPin, Building2, Clock, Briefcase, ExternalLink } from 'lucide-react';

const JobCard = ({ job, onApply }) => {
  const getMatchBadge = (score) => {
    if (score > 70) {
      return {
        color: 'bg-green-100 text-green-800 border-green-300',
        label: 'High Match',
      };
    } else if (score >= 40) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        label: 'Good Match',
      };
    } else {
      return {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        label: 'Low Match',
      };
    }
  };

  const badge = getMatchBadge(job.matchScore || 0);
  const hasResume = job.matchScore > 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Building2 className="w-4 h-4 mr-1" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>
        
        {/* Match Score Badge */}
        {hasResume && (
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${badge.color}`}>
            {job.matchScore}% {badge.label}
          </div>
        )}
      </div>

      {/* Job Details */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {job.location}
        </div>
        <div className="flex items-center">
          <Briefcase className="w-4 h-4 mr-1" />
          {job.jobType}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {job.workMode}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Match Details */}
      {hasResume && job.matchDetails && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Why this matches:</p>
          {job.matchDetails.matchingSkills && job.matchDetails.matchingSkills.length > 0 && (
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Matching skills:</span>{' '}
              {job.matchDetails.matchingSkills.join(', ')}
            </p>
          )}
          {job.matchDetails.reasoning && (
            <p className="text-sm text-gray-600">
              {job.matchDetails.reasoning}
            </p>
          )}
        </div>
      )}

      {/* Salary & Apply Button */}
      <div className="flex justify-between items-center">
        {job.salary && (
          <span className="text-lg font-semibold text-gray-900">
            {job.salary}
          </span>
        )}
        <button
          onClick={() => onApply(job)}
          className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
