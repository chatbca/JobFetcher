import React, { useState } from 'react';
import { X, Upload, FileText, Loader2, Check } from 'lucide-react';
import { uploadResume } from '../services/api';

const ResumeUpload = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['application/pdf', 'text/plain'];
      if (!validTypes.includes(selectedFile.type)) {
        setErrorMessage('Please upload a PDF or TXT file');
        setUploadStatus('error');
        return;
      }
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage('File size must be less than 5MB');
        setUploadStatus('error');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      await uploadResume(file);
      setUploadStatus('success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.error || 'Failed to upload resume. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
          {uploadStatus !== 'success' && (
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
          {uploadStatus === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-100 rounded-full p-3">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Upload Successful!</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your resume has been processed. We'll use it to match you with relevant jobs.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Upload your resume to get AI-powered job matches based on your skills and experience.
              </p>

              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                {file ? (
                  <div className="space-y-2">
                    <FileText className="w-12 h-12 mx-auto text-blue-600" />
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF or TXT (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <input
                id="file-input"
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Error Message */}
              {uploadStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Resume'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
