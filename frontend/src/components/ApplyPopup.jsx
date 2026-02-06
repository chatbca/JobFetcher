import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { createApplication } from '../services/api';

const ApplyPopup = ({ job, onClose, onSuccess }) => {
  const [stage, setStage] = useState('confirm'); // confirm, applying, applied, success
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [windowClosed, setWindowClosed] = useState(false);

  const handleOpenApplication = () => {
    // Open external job application in new tab
    const externalUrl = job.applyLink || job.url || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company + ' job application')}`;
    
    window.open(externalUrl, '_blank');
    
    // Move to next stage after a brief delay
    setTimeout(() => {
      setStage('applied');
    }, 1000);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status,
        notes,
        appliedDate: new Date().toISOString(),
      });
      setStage('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save application:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {stage === 'success' ? ' Application Saved!' : 'Apply to Job'}
          </h2>
          {stage !== 'success' && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {stage === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                {job.location && (
                  <p className="text-sm text-gray-500 mt-1"> {job.location}</p>
                )}
              </div>
              
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  Click below to open the application page in a new tab. When you return, I'll ask if you completed your application.
                </p>
              </div>
              
              <button
                onClick={handleOpenApplication}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
              >
                <ExternalLink className="w-5 h-5" />
                Open Application Page
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          )}

          {stage === 'applied' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">
                  Did you apply to {job.company}?
                </p>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Applied"> Yes, Applied</option>
                  <option value="In Progress"> Started (Incomplete)</option>
                  <option value="Not Applied"> No, Just Browsing</option>
                  <option value="Applied Earlier"> Applied Earlier</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Submitted resume, filled out questionnaire, saved for later..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Saving...' : 'Track Application'}
                </button>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Application Tracked!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  View your application in the Applications tab
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyPopup;