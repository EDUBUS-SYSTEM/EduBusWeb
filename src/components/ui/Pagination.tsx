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
    <div
      className={`w-full flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {showInfo &&
        totalItems !== undefined &&
        itemsPerPage !== undefined && (
          <div className="text-sm text-gray-600 text-center">
            Showing{" "}
            <span className="font-semibold">
              {startIndex}-{endIndex}
            </span>{" "}
            of{" "}
            <span className="font-semibold">{totalItems}</span> results
          </div>
        )}

      <div className="flex items-center justify-center space-x-3 rounded-full bg-[#FFFEF0] px-6 py-3 shadow-sm">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Previous page"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex space-x-2">
          {getPageNumbers().map((pageNumber, index) =>
            pageNumber === "..." ? (
              <span
                key={index}
                className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500"
              >
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => onPageChange(pageNumber as number)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200 ${
                  currentPage === pageNumber
                    ? "bg-[#FAD23C] text-[#463B3B]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
          aria-label="Next page"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;