const Pagination = ({ currentPage, totalPages, onPageChange, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  const changePage = typeof onPageChange === 'function'
    ? onPageChange
    : typeof setCurrentPage === 'function'
    ? setCurrentPage
    : () => {};

  return (
    <div className="mt-6 flex justify-center space-x-2">
      <button
        onClick={() => changePage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
      >
        Previous
      </button>
      <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => changePage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
