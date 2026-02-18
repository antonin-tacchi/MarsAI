import { useEffect, useState, useCallback, useMemo } from "react";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/SearchBar";
import Button from "../components/Button";
import FilmFilters from "../components/FilmFilters";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PER_PAGE = 20;

// --- COMPOSANT SKELETON (ÉTAT DE CHARGEMENT) ---
const SkeletonCard = () => (
  <div className="block w-[260px]">
    <div className="w-full h-[160px] rounded-lg animate-shimmer mb-4" />
    <div className="h-6 animate-shimmer rounded w-3/4 mb-2" />
    <div className="h-4 animate-shimmer rounded w-1/2" />
  </div>
);

export default function Catalogs() {
  const [films, setFilms] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);

  const [ranking, setRanking] = useState([]);

  // --- FILTRES ---
  const [filters, setFilters] = useState({
    selected: "all",
    country: "",
    ai: "",
    category: "",
    rated: false,
  });

  // --- FETCH FILMS ---
  const fetchFilms = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/films?all=1`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Erreur lors du chargement");
      }

      setFilms(data?.data || []);
      setStatus("idle");
    } catch (err) {
      setError("Impossible de se connecter au serveur.");
      setStatus("idle");
    }
  }, []);

  // --- FETCH RANKING (si connecté) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL}/api/jury/results`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success) setRanking(data.data);
      })
      .catch(() => {});
  }, []);

  // --- FETCH STATS ---
  useEffect(() => {
    fetch(`${API_URL}/api/films/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      });
  }, []);

  useEffect(() => {
    fetchFilms();
  }, [fetchFilms]);

  // --- PAYS DEPUIS STATS ---
  const countries = useMemo(() => {
    return stats?.byCountry?.map((c) => c.country) || [];
  }, [stats]);

  // --- OUTILS IA DEPUIS STATS ---
  const aiTools = useMemo(() => {
    return stats?.byAITool?.map((t) => t.tool) || [];
  }, [stats]);

  // --- CATÉGORIES DEPUIS STATS ---
  const categories = useMemo(() => {
    return (
      stats?.byCategory?.map((c) => ({
        id: c.category_id,
        name: c.category_name,
        count: c.count,
      })) || []
    );
  }, [stats]);

  // --- INDEX RANKING ---
  const rankingMap = useMemo(() => {
    const map = new Map();
    ranking.forEach((r) => map.set(r.film_id, r));
    return map;
  }, [ranking]);

  // Nombre de films notés (pour le badge du filtre)
  const ratedCount = useMemo(() => {
    return films.filter((f) => rankingMap.has(f.id) && rankingMap.get(f.id).average_rating !== null).length;
  }, [films, rankingMap]);

  // --- FILTRAGE FINAL ---
  const filteredFilms = useMemo(() => {
    return films.filter((film) => {
      if (filters.selected === "selected" && film.status !== "selected")
        return false;

      if (filters.rated) {
        const r = rankingMap.get(film.id);
        if (!r || r.average_rating === null) return false;
      }

      if (filters.country && film.country !== filters.country) return false;

      if (
        filters.ai &&
        !film.ai_tools_used?.toLowerCase().includes(filters.ai.toLowerCase())
      )
        return false;

      // Filtre par catégorie
      if (filters.category && film.categories) {
        if (
          !film.categories
            .toLowerCase()
            .includes(filters.category.toLowerCase())
        )
          return false;
      }

      if (query && !film.title.toLowerCase().includes(query.toLowerCase()))
        return false;

      return true;
    });
  }, [films, filters, query, rankingMap]);

  // --- TRI PAR RANG SI FILTRE ACTIF ---
  const sortedFilms = useMemo(() => {
    if (!filters.rated) return filteredFilms;
    return [...filteredFilms].sort((a, b) => {
      const ra = rankingMap.get(a.id)?.rank ?? Infinity;
      const rb = rankingMap.get(b.id)?.rank ?? Infinity;
      return ra - rb;
    });
  }, [filteredFilms, filters.rated, rankingMap]);

  // --- PAGINATION (basée sur le résultat filtré) ---
  const totalPages = Math.max(1, Math.ceil(sortedFilms.length / PER_PAGE));

  // Si filtres/recherche changent et que la page dépasse, on recadre
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Films à afficher sur la page courante
  const paginatedFilms = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return sortedFilms.slice(start, start + PER_PAGE);
  }, [sortedFilms, page]);

  return (
    <main className="min-h-screen bg-[#FBF5F0] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#262335] uppercase tracking-tighter mb-8 p-6 italic ">
            Catalogue
          </h1>

          <div className="max-w-2xl mb-8 p-6">
            <SearchBar value={query} onChange={setQuery} />
          </div>

          <FilmFilters
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setPage(1); // reset page quand on change les filtres
            }}
            countries={countries}
            aiTools={aiTools}
            categories={categories}
            stats={stats}
            ratedCount={ratedCount}
          />
        </header>

        {/* --- PAGINATION STYLE « ‹ 1 › » --- */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 mb-12 text-2xl text-[#262335]">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="hover:opacity-60 disabled:opacity-30"
              aria-label="Première page"
              type="button"
            >
              «
            </button>

            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="hover:opacity-60 disabled:opacity-30"
              aria-label="Page précédente"
              type="button"
            >
              ‹
            </button>

            <span className="font-black tabular-nums">{page}</span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="hover:opacity-60 disabled:opacity-30"
              aria-label="Page suivante"
              type="button"
            >
              ›
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="hover:opacity-60 disabled:opacity-30"
              aria-label="Dernière page"
              type="button"
            >
              »
            </button>
          </div>
        )}

        {/* --- ERREUR API --- */}
        {error && (
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4 text-red-400">⚠️</div>
            <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
              Erreur Serveur
            </h2>
            <p className="text-[#262335]/70 mb-6">{error}</p>
            <Button onClick={fetchFilms}>Réessayer</Button>
          </div>
        )}

        {/* --- CHARGEMENT --- */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* --- ÉTAT VIDE --- */}
        {status === "idle" && !error && sortedFilms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#262335]/10 rounded-[2.5rem] bg-[#FBF5F0]/50">
            <div className="text-6xl mb-6 opacity-30">
              {query ? "🔍" : "🎬"}
            </div>

            {query ? (
              <>
                <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
                  Aucun résultat pour cette recherche
                </h2>
                <Button
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                  className="mt-8 scale-90"
                >
                  Effacer la recherche
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
                  Aucun film dans le catalogue
                </h2>
              </>
            )}
          </div>
        )}

        {/* --- SUCCÈS --- */}
        {status === "idle" && sortedFilms.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
              {paginatedFilms.map((film) => {
                const r = rankingMap.get(film.id);
                return (
                  <FilmCard
                    key={film.id}
                    film={
                      r
                        ? {
                            ...film,
                            average_rating: r.average_rating,
                            rating_count: r.rating_count,
                          }
                        : film
                    }
                    apiUrl={API_URL}
                    rank={filters.rated && r ? r.rank : undefined}
                  />
                );
              })}
            </div>

            {/* --- PAGINATION STYLE « ‹ 1 › » --- */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 text-2xl text-[#262335]">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="hover:opacity-60 disabled:opacity-30"
                  aria-label="Première page"
                  type="button"
                >
                  «
                </button>

                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="hover:opacity-60 disabled:opacity-30"
                  aria-label="Page précédente"
                  type="button"
                >
                  ‹
                </button>

                <span className="font-black tabular-nums">{page}</span>

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="hover:opacity-60 disabled:opacity-30"
                  aria-label="Page suivante"
                  type="button"
                >
                  ›
                </button>

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="hover:opacity-60 disabled:opacity-30"
                  aria-label="Dernière page"
                  type="button"
                >
                  »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}