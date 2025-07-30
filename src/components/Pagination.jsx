import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onPreviousPage,
  onNextPage,
  isFirstPage,
  isLastPage,
  startIndex,
  endIndex,
  totalItems,
  className = "",
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`pagination-container ${className}`}>
      <div className="pagination-info">
        <span>
          Showing {startIndex + 1} to {endIndex} of {totalItems} entries
        </span>
      </div>
      <div className="pagination-controls">
        <button
          onClick={onPreviousPage}
          disabled={isFirstPage}
          className="pagination-button pagination-button-nav"
          aria-label="Previous page"
        >
          <FaChevronLeft />
          <span>Previous</span>
        </button>
        <div className="pagination-numbers">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`pagination-button pagination-button-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={onNextPage}
          disabled={isLastPage}
          className="pagination-button pagination-button-nav"
          aria-label="Next page"
        >
          <span>Next</span>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
