import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, LogOut, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from './ResumeUpload';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleResumeUploaded = () => {
    // Optionally refresh data or show success message
    console.log('Resume uploaded successfully');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/jobs" className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobTracker AI</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/jobs')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/applications"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isActive('/applications')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Applications
              </Link>
              
              <button
                onClick={() => setShowResumeUpload(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Resume Upload Modal */}
      {showResumeUpload && (
        <ResumeUpload
          onClose={() => setShowResumeUpload(false)}
          onSuccess={handleResumeUploaded}
        />
      )}
    </>
  );
};

export default Header;
