import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { createApplication } from '../services/api';

const CHOICES = [
  {
    id: 'applied',
    title: 'Yes, Applied',
    description: "Save this application with today's timestamp."
  },
  {
    id: 'earlier',
    title: 'Applied Earlier',
    description: 'Track it even though you submitted before today.'
  },
  {
    id: 'browsing',
    title: 'No, just browsing',
    description: 'Close this popup and keep your list unchanged.'
  }
];

const ApplyPopup = ({ job, onClose, onSuccess }) => {
  const [stage, setStage] = useState('confirm');
  const [choice, setChoice] = useState(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (stage !== 'applied') {
      setChoice(null);
      setNotes('');
    }
  }, [stage]);

  if (!job) return null;

  const applyUrl =
    job.applyLink ||
    job.applyUrl ||
    job.url ||
    `https://www.google.com/search?q=${encodeURIComponent(`${job.title} ${job.company} job application`)}`;

  const handleOpenApplication = () => {
    window.open(applyUrl, '_blank', 'noopener');
    setTimeout(() => {
      setStage('applied');
    }, 800);
  };

  const handleChoiceSelection = (selected) => {
    setChoice(selected);
    if (selected === 'earlier' && notes.trim().length === 0) {
      setNotes('Applied earlier (logged manually).');
    }
    if (selected !== 'earlier') {
      setNotes('');
    }
  };

  const handleSubmit = async () => {
    if (!choice) return;
    if (choice === 'browsing') {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const finalNotes =
        choice === 'earlier'
          ? notes.trim() || 'Applied earlier (logged manually).'
          : notes.trim();

      await createApplication({
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        status: 'Applied',
        appliedDate: new Date().toISOString(),
        notes: finalNotes,
        matchScore: job.matchScore,
        matchDetails: job.matchDetails,
        resumeSummary: job.matchDetails?.relevantExperience || ''
      });

      setStage('success');
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to save application:', error);
      alert('Failed to save application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const primaryButtonLabel = () => {
    if (!choice) return 'Select an option';
    return choice === 'browsing' ? 'Keep browsing' : 'Track application';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {stage === 'success' ? 'Application Saved!' : 'Apply to Job'}
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
                  <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                )}
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p>
                  I will open the application in a new tab. When you return, choose an option so I can update your tracker.
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
            <div className="space-y-5">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Did you apply to {job.title} at {job.company}?
                </p>
                <p className="text-xs text-gray-500">
                  Pick an option so I can keep your application timeline accurate.
                </p>
              </div>

              <div className="grid gap-3">
                {CHOICES.map((option) => {
                  const isSelected = choice === option.id;
                  return (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => handleChoiceSelection(option.id)}
                      className={`text-left border rounded-lg p-4 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 shadow-sm'
                          : 'border-gray-200 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">{option.title}</p>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        {isSelected && (
                          <span className="text-blue-600">
                            <Check className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {choice && choice !== 'browsing' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Submitted resume, waiting for coding challenge..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!choice || isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Saving...' : primaryButtonLabel()}
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
                  View and update it anytime from the Applications tab.
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
