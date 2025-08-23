'use client';

import React, { useRef } from 'react';
import { Upload, Download } from 'lucide-react';

interface UploadButtonProps {
  onFileSelect?: (files: File[]) => void;
  onDownloadTemplate?: () => void;
  className?: string;
  showDownloadTemplate?: boolean;
  accept?: string;
  multiple?: boolean;
}

const UploadButton: React.FC<UploadButtonProps> = ({ 
  onFileSelect, 
  onDownloadTemplate,
  className = '',
  showDownloadTemplate = false,
  accept = '*/*',
  multiple = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <button
        onClick={openFileDialog}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg
          bg-blue-50 text-blue-600 hover:bg-blue-100
          transition-all duration-300 border border-blue-200
          hover:border-blue-300 ${className}
        `}
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm font-medium">Import files</span>
      </button>
      
      {showDownloadTemplate && onDownloadTemplate && (
        <button
          onClick={onDownloadTemplate}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg
                     bg-green-50 text-green-600 hover:bg-green-100
                     transition-all duration-300 border border-green-200
                     hover:border-green-300"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Download template</span>
        </button>
      )}
    </div>
  );
};

export default UploadButton;
