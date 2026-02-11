import { useEffect, useState, useCallback, useMemo } from "react";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import FilmFilters from "../components/FilmFilters";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PER_PAGE = 20;

// --- SKELETON COMPONENT (LOADING STATE) ---
const SkeletonCard = () => (
  <div className="block w-[260px]">
    <div className="w-full h-[160px] rounded-lg animate-shimmer mb-4" />
    <div className="h-6 animate-shimmer rounded w-3/4 mb-2" />
    <div className="h-4 animate-shimmer rounded w-1/2" />
  </div>
);

// --- PAGINATION COMPONENT ---
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const delta = 1; // nombre de pages à afficher autour de la page active

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      <Button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</Button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-3 py-1">…</span>
        ) : (
          <Button
            key={i}
            onClick={() => onPageChange(p)}
            className={p === currentPage ? "font-bold bg-gray-200" : ""}
          >
            {p}
          </Button>
        )
      )}
      <Button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
    </div>
  );
}

export default function Catalogs() {
  const [films, setFilms] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const [filters, setFilters] = useState({
    selected: "all",
    country: "",
    ai: "",
    category: "",
  });

  // --- FETCH FILMS ---
  const fetchFilms = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/films?all=1`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Error while loading");
      setFilms(data?.data || []);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
      setStatus("idle");
    }
  }, []);

  // --- FETCH STATS ---
  useEffect(() => {
    fetch(`${API_URL}/api/films/stats`)
      .then(res => res.json())
      .then(data => data.success && setStats(data.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  const countries = useMemo(() => stats?.byCountry.map(c => c.country) || [], [stats]);
  const aiTools = useMemo(() => stats?.byAITool.map(t => t.tool) || [], [stats]);
  const categories = useMemo(() => stats?.byCategory.map(c => ({ id: c.category_id, name: c.category_name })) || [], [stats]);

  // --- FILTRAGE ---
  const filteredFilms = useMemo(() => {
    return films.filter(film => {
      if (filters.selected === "selected" && film.status !== "approved") return false;
      if (filters.country && film.country !== filters.country) return false;
      if (filters.ai && !film.ai_tools_used?.toLowerCase().includes(filters.ai.toLowerCase())) return false;
      if (filters.category && film.categories && !film.categories.toLowerCase().includes(filters.category.toLowerCase())) return false;
      if (query && !film.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [films, filters, query]);

  const totalPages = Math.max(1, Math.ceil(filteredFilms.length / PER_PAGE));
  const displayedFilms = filteredFilms.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // --- RENDER ---
  return (
    <main className="min-h-screen bg-[#FBF5F0] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#262335] uppercase tracking-tighter mb-8 p-6 italic">Catalogue</h1>
          <div className="max-w-2xl mb-8 p-6">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <FilmFilters
            filters={filters}
            onChange={setFilters}
            countries={countries}
            aiTools={aiTools}
            categories={categories}
            stats={stats}
          />
        </header>

        {error && (
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4 text-red-400">⚠️</div>
            <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">Erreur Serveur</h2>
            <p className="text-[#262335]/70 mb-6">{error}</p>
            <Button onClick={fetchFilms}>Retry</Button>
          </div>
        )}

        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {status === "idle" && filteredFilms.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#262335]/10 rounded-[2.5rem] bg-[#FBF5F0]/50">
            <div className="text-6xl mb-6 opacity-30">{query ? "🔍" : "🎬"}</div>
            {query ? (
              <>
                <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">No results found</h2>
                <Button onClick={() => setQuery("")} className="mt-8 scale-90">Clear search</Button>
              </>
            ) : (
              <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">No films in the catalog</h2>
            )}
          </div>
        )}

        {status === "idle" && filteredFilms.length > 0 && (
          <>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
              {displayedFilms.map(film => <FilmCard key={film.id} film={film} apiUrl={API_URL} />)}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </main>
  );
}
