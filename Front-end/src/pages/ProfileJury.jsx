import { useCallback, useEffect, useMemo, useState } from "react";
import FilmCard from "../components/FilmCard";
import Button from "../components/Button";

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

export default function ProfileJury() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("loading"); // "loading" | "idle"
  const [error, setError] = useState("");

  const [films, setFilms] = useState([]);
  const [filmCount, setFilmCount] = useState(0);
  const [page, setPage] = useState(1);

  const [stats, setStats] = useState({
    totalAssigned: 0,
    totalUnrated: 0,
    totalRated: 0,
  });

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((filmCount || 0) / PER_PAGE));
  }, [filmCount]);

  const fetchFilms = useCallback(async (p = 1) => {
    setStatus("loading");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/jury/assigned-films?page=${p}&limit=${PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur lors du chargement");

      const items = json?.data ?? [];
      const total = json?.pagination?.totalItems ?? 0;

      setFilms(items);
      setFilmCount(total);

      setStats({
        totalAssigned: json?.stats?.totalAssigned ?? 0,
        totalUnrated: json?.stats?.totalUnrated ?? 0,
        totalRated: json?.stats?.totalRated ?? 0,
      });

      // recale la page si elle dépasse le max (ex: films retirés)
      const newTotalPages = Math.max(1, Math.ceil(total / PER_PAGE));
      if (p > newTotalPages) setPage(newTotalPages);
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur.");
    } finally {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message);
        setUser(json?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    fetchFilms(page);
  }, [page, fetchFilms]);

  if (loading) {
    return (
      <div className="bg-[#FBF5F0] flex">
        <h1>Chargement...</h1>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-4 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-[#262335]">
            Bonjour {user?.name || "Jury"}
          </h1>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Se déconnecter
          </Button>
        </div>

        <div className="bg-gradient-to-br from-[#e7cfc7] via-[#9a92c9] to-[#2f2a73] flex justify-between gap-4 p-4 rounded-lg text-white ml-8">
          <div className="bg-[#262335] rounded-lg p-2">
            nombre de film : {stats.totalAssigned}
          </div>

          <div className="flex gap-8">
            <div className="bg-[#262335] rounded-lg p-2">
              non Noté : {stats.totalUnrated}
            </div>
            <div className="bg-[#262335] rounded-lg p-2">
              Noté : {stats.totalRated}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[#262335] font-semibold p-4 text-xl">
            Film à noter :
          </h2>

          {/* --- ERREUR API --- */}
          {error && (
            <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
              <div className="text-5xl mb-4 text-red-400">⚠️</div>
              <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
                Erreur Serveur
              </h2>
              <p className="text-[#262335]/70 mb-6">{error}</p>
              <Button onClick={() => fetchFilms(page)}>Réessayer</Button>
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
          {status === "idle" && !error && films.length === 0 && (
            <p>Aucun film assigné pour le moment.</p>
          )}

          {/* --- SUCCÈS --- */}
          {status === "idle" && !error && films.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
                {films.map((film) => (
                  <FilmCard key={film.id} film={film} apiUrl={API_URL} />
                ))}
              </div>

              {/* --- PAGINATION --- */}
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
      </div>
    </div>
  );
}