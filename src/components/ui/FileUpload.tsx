'use client';

import React, { useRef } from 'react';
import { FolderOpen, X } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  error?: string;
  helperText?: string;
  accept?: string;
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
  selectedFiles?: File[];
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  helperText,
  accept = '*/*',
  multiple = false,
  onFileSelect,
  selectedFiles = [],
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    if (onFileSelect) {
      onFileSelect(newFiles);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="space-y-3">
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
                 {/* Select Folder Button */}
                                       <button
             type="button"
             onClick={openFileDialog}
             className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 
                        bg-white hover:border-blue-400 hover:bg-blue-50 
                        transition-all duration-300 flex items-center justify-center
                        text-gray-600 hover:text-blue-600"
           >
          <FolderOpen className="w-5 h-5 mr-2" />
          <span className="font-medium">Select folder</span>
        </button>

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
                                                                                                                       <div
                   key={index}
                   className="flex items-center justify-between p-3 bg-white 
                              rounded-xl border border-gray-200"
                 >
                <span className="text-sm text-gray-700 truncate flex-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500 
                             transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FileUpload;
