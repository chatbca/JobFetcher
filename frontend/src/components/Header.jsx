import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, FileText, LogOut, Upload, Menu, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ResumeUpload from './ResumeUpload';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleResumeUploaded = () => {
    console.log('Resume uploaded successfully');
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/jobs"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${mobile ? 'w-full text-center' : ''
          } ${isActive('/jobs')
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
            : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
      >
        Jobs
      </Link>
      <Link
        to="/applications"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${mobile ? 'w-full text-center' : ''
          } ${isActive('/applications')
            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
            : 'text-slate-300 hover:text-white hover:bg-navy-800'
          }`}
      >
        Applications
      </Link>
    </>
  );

  return (
    <>
      <header style={{
        background: 'var(--navy-900)',
        borderBottom: '1px solid var(--navy-700)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/jobs" className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg flex-shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight truncate">JobTracker AI</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <NavLinks />

              <button
                onClick={() => setShowResumeUpload(true)}
                className="flex items-center gap-2 px-5 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-bold transition-all duration-200 shadow-lg shadow-teal-500/20"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-4 pl-4 border-l border-navy-700">
                <div className="text-right">
                  <p className="text-sm font-bold text-white leading-tight">{user?.name || 'User'}</p>
                  <p className="text-[11px] font-medium text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-navy-700 py-4 px-4 bg-navy-900 shadow-2xl">
            <div className="flex flex-col gap-4">
              <NavLinks mobile />
              <button
                onClick={() => {
                  setShowResumeUpload(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-teal-500 text-white rounded-lg font-bold"
              >
                <Upload className="w-4 h-4" />
                Upload Resume
              </button>

              <div className="pt-4 border-t border-navy-700 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-slate-400">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 font-bold hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
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
