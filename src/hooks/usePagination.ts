import { useState, useEffect } from 'react';

export function usePagination(totalItems: number, itemsPerPage: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    // Reset to page 1 if current page is invalid for new data size
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalItems, itemsPerPage, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  // Ensure endIndex doesn't exceed totalItems
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  // Helper to slice data
  const paginate = <T,>(data: T[]): T[] => {
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    paginate
  };
}
