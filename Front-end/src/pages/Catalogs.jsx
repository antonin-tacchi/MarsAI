import { useEffect, useMemo, useState } from "react";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/SearchBar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PER_PAGE = 20;

export default function Catalogs() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: PER_PAGE,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadFilms() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${API_URL}/api/films?page=${page}&limit=${PER_PAGE}`,
          { signal: controller.signal }
        );

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message || "Failed to load films");

        if (!isMounted) return;

        setFilms(data?.data || []);
        setPagination(
          data?.pagination || {
            totalItems: 0,
            totalPages: 1,
            currentPage: page,
            itemsPerPage: PER_PAGE,
          }
        );
      } catch (err) {
        if (!isMounted) return;
        if (err?.name === "AbortError") return;
        setError(err?.message || "Unknown error");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadFilms();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(Math.max(1, pagination.totalPages));
    }
  }, [pagination.totalPages, page]);

  const filteredFilms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return films;

    return films.filter((f) => {
      const title = (f?.title || "").toLowerCase();
      const first = (f?.director_firstname || "").toLowerCase();
      const last = (f?.director_lastname || "").toLowerCase();
      return (
        title.includes(q) ||
        first.includes(q) ||
        last.includes(q) ||
        `${first} ${last}`.includes(q)
      );
    });
  }, [films, query]);

  const canPrev = pagination.currentPage > 1;
  const canNext = pagination.currentPage < pagination.totalPages;

  const goFirst = () => {
    if (!canPrev) return;
    setPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goLast = () => {
    if (!canNext) return;
    setPage(pagination.totalPages);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    if (!canPrev) return;
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (!canNext) return;
    setPage((p) => Math.min(pagination.totalPages, p + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10 py-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-[#262335] w-full text-left">CATALOGUES</h1>

          <div className="w-full flex">
            <div className="w-full max-w-[700px]">
              <SearchBar value={query} onChange={setQuery} />
            </div>
          </div>
        </div>

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex items-center rounded-[14px]">
              <button
                onClick={goFirst}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Première page"
              >
                ≪
              </button>

              <button
                onClick={goPrev}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page précédente"
              >
                ‹
              </button>

              <span className="flex items-center justify-center min-w-[2rem] px-2 text-[#262335] text-xl font-medium">
                {pagination.currentPage}
              </span>

              <button
                onClick={goNext}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page suivante"
              >
                ›
              </button>

              <button
                onClick={goLast}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Dernière page"
              >
                ≫
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mt-8">
          {loading && <p className="text-[#262335]">Chargement des films…</p>}

          {!loading && error && <p className="text-red-600">Erreur : {error}</p>}

          {!loading && !error && filteredFilms.length === 0 && (
            <p className="text-[#262335]">
              Aucun résultat pour “{query}”.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {filteredFilms.map((film) => (
              <FilmCard key={film.id} film={film} apiUrl={API_URL} />
            ))}
          </div>
        </div>

        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex items-center rounded-[14px]">
              <button
                onClick={goFirst}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Première page"
              >
                ≪
              </button>

              <button
                onClick={goPrev}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page précédente"
              >
                ‹
              </button>

              <span className="flex items-center justify-center min-w-[2rem] px-2 text-[#262335] text-xl font-medium">
                {pagination.currentPage}
              </span>

              <button
                onClick={goNext}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page suivante"
              >
                ›
              </button>

              <button
                onClick={goLast}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext
                    ? "text-[#262335]"
                    : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Dernière page"
              >
                ≫
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
