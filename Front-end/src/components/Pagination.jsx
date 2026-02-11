import React from "react";

export default function Pagination({ currentPage, totalItems, perPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / perPage);

  if (totalPages <= 1) return null; // pas besoin de pagination si une seule page

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-12 gap-2 flex-wrap">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-full font-semibold transition-colors
            ${page === currentPage ? "bg-[#463699] text-white" : "bg-[#FBF5F0] text-[#463699] border border-[#463699] hover:bg-[#463699]/10"}`}
        >
          {page}
        </button>
      ))}
    </div>
  );
}
