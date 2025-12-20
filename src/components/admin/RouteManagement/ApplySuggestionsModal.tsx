// EduBusWeb/src/components/admin/RouteManagement/ApplySuggestionsModal.tsx
import React from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

interface ApplySuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  isApplying: boolean;
  suggestedRoutesCount: number;
}

const ApplySuggestionsModal: React.FC<ApplySuggestionsModalProps> = ({
  isOpen,
  onClose,
  onApply,
  isApplying,
  suggestedRoutesCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Apply Route Suggestions</h2>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Warning Content */}
        <div className="mb-6">
          <p className="text-gray-600 text-sm">
            Are you sure you want to proceed with applying these route suggestions?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isApplying}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            disabled={isApplying}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-lg transition-colors"
          >
            {isApplying ? 'Applying...' : 'Apply Suggestions'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplySuggestionsModal;