export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handleFirst = () => onPageChange(1);
  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLast = () => onPageChange(totalPages);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={handleFirst}
        disabled={currentPage === 1}
        className="px-3 py-2 text-[#262335] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
        aria-label="First page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-2 text-[#262335] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
        aria-label="Previous page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <span className="px-6 py-2 text-[#262335] font-[Saira] text-lg">
        {currentPage}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-[#262335] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
        aria-label="Next page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <button
        onClick={handleLast}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-[#262335] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
        aria-label="Last page"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 17l5-5-5-5M6 17l5-5-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
