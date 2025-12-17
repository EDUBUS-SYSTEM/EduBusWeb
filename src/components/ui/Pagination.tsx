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
    const maxPagesToShow = 5;

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
    <div
      className={`w-full flex items-center ${showInfo && totalItems !== undefined && itemsPerPage !== undefined ? 'justify-between' : 'justify-center'} ${className}`}
    >
      {showInfo &&
        totalItems !== undefined &&
        itemsPerPage !== undefined && (
          <div className="text-sm text-gray-700 font-medium">
            Showing{" "}
            <span className="font-semibold">
              {startIndex} to {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-semibold">{totalItems}</span> entries
          </div>
        )}

      <div className={`flex items-center justify-center ${showInfo && totalItems !== undefined && itemsPerPage !== undefined ? 'flex-1' : ''}`}>
        <div className="flex items-center justify-center space-x-2 rounded-lg bg-gray-100 border border-gray-300 px-4 py-2.5">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Previous page"
          >
            <FaChevronLeft className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center space-x-2">
            {getPageNumbers().map((pageNumber, index) =>
              pageNumber === "..." ? (
                <span
                  key={index}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm"
                >
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(pageNumber as number)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${currentPage === pageNumber
                      ? "bg-[#FAD23C] text-gray-800 shadow-sm"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Next page"
          >
            <FaChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;