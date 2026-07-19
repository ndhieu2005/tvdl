export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex gap-2 justify-center mt-6">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold ${
            p === page ? 'bg-blue text-white' : 'border border-blue text-blue hover:bg-blue/10'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
