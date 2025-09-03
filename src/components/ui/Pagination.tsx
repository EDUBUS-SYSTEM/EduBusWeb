
'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const clamp = (v: number) => Math.max(1, Math.min(totalPages, v));

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: (number | '...')[] = [];
    const add = (p: number | '...') => pages.push(p);

    add(1);

    const start = clamp(currentPage - 1);
    const end = clamp(currentPage + 1);

    if (start > 2) add('...');
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPages) add(p);
    }
    if (end < totalPages - 1) add('...');
    add(totalPages);

    return pages;
  };

  const isActive = (p: number) => p === currentPage;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        className="px-2 h-8 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
        onClick={() => onPageChange(clamp(currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        {'<'}
      </button>

      {getPages().map((p, idx) =>
        p === '...' ? (
          <span key={`e-${idx}`} className="px-2 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-md ${
              isActive(p) ? 'bg-yellow-400 text-gray-800 font-medium' : 'bg-gray-100 text-gray-700'
            }`}
            aria-current={isActive(p) ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className="px-2 h-8 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
        onClick={() => onPageChange(clamp(currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
