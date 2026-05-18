import { motion } from 'framer-motion';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const range = 2;
  for (let i = Math.max(1, currentPage - range); i <= Math.min(totalPages, currentPage + range); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-xl border border-dark-700 text-white/60 hover:text-white hover:border-gold-500
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-4 py-2 rounded-xl text-white/60 hover:text-gold-400 transition-colors">1</button>
          {pages[0] > 2 && <span className="text-dark-600">…</span>}
        </>
      )}

      {pages.map(p => (
        <motion.button
          key={p}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-xl font-medium transition-all ${
            p === currentPage
              ? 'bg-gold-gradient text-black shadow-gold'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          {p}
        </motion.button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="text-dark-600">…</span>}
          <button onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 rounded-xl text-white/60 hover:text-gold-400 transition-colors">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-xl border border-dark-700 text-white/60 hover:text-white hover:border-gold-500
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
}
