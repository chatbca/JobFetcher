import React from 'react';
import { MapPin, Building2, Clock, Briefcase, ExternalLink, Sparkles } from 'lucide-react';

const JobCard = ({ job, onApply, compact = false }) => {
  const getMatchLevel = (score) => {
    if (score > 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  const getMatchLabel = (score) => {
    if (score > 70) return 'Excellent Match';
    if (score >= 40) return 'Good Match';
    return 'Match';
  };

  const matchLevel = job.matchScore ? getMatchLevel(job.matchScore) : null;
  const hasResume = job.matchScore > 0;

  return (
    <div className={`job-card ${compact ? 'compact' : ''}`}>
      <div className="job-card-header">
        <div className="job-company-logo">
          {job.company?.substring(0, 2).toUpperCase() || 'JB'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 className="job-card-title">{job.title}</h3>
          <p className="job-card-company">
            <Building2 className="w-4 h-4" />
            {job.company}
          </p>
        </div>
        {hasResume && (
          <div className={`match-badge ${matchLevel}`}>
            <Sparkles className="w-4 h-4" />
            <span>{job.matchScore}%</span>
          </div>
        )}
      </div>

      <div className="job-card-meta">
        {job.location && (
          <span>
            <MapPin className="w-4 h-4" />
            {job.location}
          </span>
        )}
        {job.jobType && (
          <span>
            <Briefcase className="w-4 h-4" />
            {job.jobType}
          </span>
        )}
        {job.workMode && (
          <span>
            <Clock className="w-4 h-4" />
            {job.workMode}
          </span>
        )}
      </div>

      {!compact && job.description && (
        <p className="job-card-description">{job.description}</p>
      )}

      {!compact && job.skills && job.skills.length > 0 && (
        <div className="job-card-skills">
          {job.skills.slice(0, 6).map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="skill-tag" style={{ opacity: 0.6 }}>
              +{job.skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {hasResume && job.matchDetails && (
        <div className={`match-reasoning ${compact ? 'compact' : ''}`}>
          <p className="reasoning-label">
            Why this matches
          </p>
          {!compact && job.matchDetails.matchingSkills && job.matchDetails.matchingSkills.length > 0 && (
            <p className="reasoning-skills">
              <span style={{ fontWeight: 600 }}>Your skills:</span>{' '}
              {job.matchDetails.matchingSkills.slice(0, 4).join(', ')}
              {job.matchDetails.matchingSkills.length > 4 && ` +${job.matchDetails.matchingSkills.length - 4} more`}
            </p>
          )}
          {job.matchDetails.reasoning && (
            <p className="reasoning-text">
              {job.matchDetails.reasoning}
            </p>
          )}
        </div>
      )}

      <div className="job-card-footer">
        {job.salary && (
          <span className="job-salary">{job.salary}</span>
        )}
        <button onClick={() => onApply(job)} className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          Apply Now
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JobCard;
