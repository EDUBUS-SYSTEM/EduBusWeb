'use client';

import React from 'react';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  onClick?: () => void;
  className?: string;
}

const UploadButton: React.FC<UploadButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg
        bg-blue-50 text-blue-600 hover:bg-blue-100
        transition-all duration-300 border border-blue-200
        hover:border-blue-300 ${className}
      `}
    >
      <Upload className="w-4 h-4" />
      <span className="text-sm font-medium">Upload files</span>
    </button>
  );
};

export default UploadButton;
