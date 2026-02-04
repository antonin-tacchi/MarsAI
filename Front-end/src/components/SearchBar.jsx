import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function SearchBar({
  value,
  onChange,
  loading = false,
  error = "",
}) {
  return (
    <div className="w-full">
      <div className="relative w-full max-w-[600px]">
        {/* Icône */}
        <MagnifyingGlassIcon
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
            ${loading ? "text-[#9A95A1]" : "text-[#262335] opacity-60"}
            pointer-events-none`}
        />

        {/* Input */}
        <input
          type="text"
          placeholder={
            loading
              ? "Chargement des films…"
              : "Rechercher un réalisateur, un film…"
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className={`
            w-full text-[#262335] border bg-[#C7C2CE]
            rounded-md py-2 pl-10 pr-3
            focus:outline-none transition
            ${loading
              ? "cursor-wait opacity-70 border-gray-200"
              : "border-gray-300 focus:border-[#262335]"}
          `}
        />
      </div>

      {/* Erreur */}
      {error && !loading && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
