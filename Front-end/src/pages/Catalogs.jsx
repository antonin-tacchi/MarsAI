import { useEffect, useMemo, useState, useCallback } from "react";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/SearchBar";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PER_PAGE = 20;

export default function Catalogs() {
  const [films, setFilms] = useState([]);
  const [query, setQuery] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: PER_PAGE,
  });

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const fetchFilms = useCallback(async (p, signal) => {
    setStatus("loading");
    setError("");

    const res = await fetch(`${API_URL}/api/films?page=${p}&limit=${PER_PAGE}`, {
      signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Failed to load films");

    setFilms(data?.data || []);
    setPagination(
      data?.pagination || {
        totalItems: 0,
        totalPages: 1,
        currentPage: p,
        itemsPerPage: PER_PAGE,
      }
    );

    setStatus("success");
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        await fetchFilms(page, controller.signal);
      } catch (err) {
        if (!isMounted) return;
        if (err?.name === "AbortError") return;
        setStatus("error");
        setError(err?.message || "Unknown error");
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, fetchFilms]);

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(Math.max(1, pagination.totalPages));
    }
  }, [pagination.totalPages, page]);

  const filteredFilms = useMemo(() => {
    if (status !== "success") return [];
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
  }, [films, query, status]);

  const canPrev = pagination.currentPage > 1;
  const canNext = pagination.currentPage < pagination.totalPages;

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const goFirst = () => canPrev && (setPage(1), scrollTop());
  const goLast = () => canNext && (setPage(pagination.totalPages), scrollTop());
  const goPrev = () => canPrev && (setPage((p) => Math.max(1, p - 1)), scrollTop());
  const goNext = () => canNext && (setPage((p) => Math.min(pagination.totalPages, p + 1)), scrollTop());

  const retry = () => {
    setPage((p) => p);
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10 py-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-[#262335] w-full text-left">CATALOGUES</h1>

          <div className="w-full flex">
            <div className="w-full max-w-[700px]">
              <SearchBar
                value={query}
                onChange={setQuery}
                loading={status === "loading"}
                error={status === "error" ? error : ""}
              />
            </div>
          </div>
        </div>

        {/* Pagination */}
        {status === "success" && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex items-center rounded-[14px] gap-4">
              <button
                onClick={goFirst}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Première page"
              >
                ≪
              </button>

              <button
                onClick={goPrev}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
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
                  canNext ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page suivante"
              >
                ›
              </button>

              <button
                onClick={goLast}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
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
          {status === "loading" && (
            <div className="text-[#262335]">
              <p>Chargement des films…</p>
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-red-700 font-medium">Erreur : {error}</p>
              <button
                onClick={retry}
                className="mt-3 inline-flex items-center rounded-lg bg-[#262335] px-4 py-2 text-white"
              >
                Réessayer
              </button>
            </div>
          )}

          {status === "success" && filteredFilms.length === 0 && (
            <p className="text-[#262335]">Aucun résultat pour “{query}”.</p>
          )}

          {status === "success" && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
              {filteredFilms.map((film) => (
                <FilmCard key={film.id} film={film} apiUrl={API_URL} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {status === "success" && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="inline-flex items-center rounded-[14px] gap-4">
              <button
                onClick={goFirst}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Première page"
              >
                ≪
              </button>

              <button
                onClick={goPrev}
                disabled={!canPrev}
                className={`text-xl leading-none select-none ${
                  canPrev ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
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
                  canNext ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
                }`}
                aria-label="Page suivante"
              >
                ›
              </button>

              <button
                onClick={goLast}
                disabled={!canNext}
                className={`text-xl leading-none select-none ${
                  canNext ? "text-[#262335]" : "text-[#9A95A1] opacity-75 cursor-not-allowed"
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
