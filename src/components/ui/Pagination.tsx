'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
  className = '',
}) => {

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Number of page buttons to show (e.g., 1 ... 4 5 6 ... 10)

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > maxPagesToShow - 2) {
        pageNumbers.push("...");
      }

      let startPage = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2) + 1);
      let endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPagesToShow / 2) - 1);

      if (currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        endPage = maxPagesToShow - 1;
      } else if (currentPage >= totalPages - Math.floor(maxPagesToShow / 2)) {
        startPage = totalPages - maxPagesToShow + 2;
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - Math.floor(maxPagesToShow / 2)) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };


  const startIndex = itemsPerPage && totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIndex = itemsPerPage && totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className={`w-full flex flex-col items-center justify-center space-y-3 ${className}`}>
      {showInfo && totalItems !== undefined && itemsPerPage !== undefined && (
        <div className="text-sm text-gray-600 text-center">
          Hiển thị <span className="font-semibold">{startIndex}-{endIndex}</span> trong tổng số <span className="font-semibold">{totalItems}</span> kết quả
        </div>
      )}

      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Previous page"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex space-x-1">
          {getPageNumbers().map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span key={index} className="px-3 py-2 text-gray-700">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(pageNumber as number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  currentPage === pageNumber
                    ? "bg-[#fad23c] text-[#463B3B]"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Next page"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;