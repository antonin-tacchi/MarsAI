import { useCallback, useEffect, useState } from "react";
import FilmCard from "../components/FilmCard";
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ProfileJury() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const [filmCount, setFilmCount] = useState(0);
  const [films, setFilms] = useState([]);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const SkeletonCard = () => (
    <div className="block w-[260px]">
      <div className="w-full h-[160px] rounded-lg animate-shimmer mb-4" />
      <div className="h-6 animate-shimmer rounded w-3/4 mb-2" />
      <div className="h-4 animate-shimmer rounded w-1/2" />
    </div>
  );

  const fetchFilms = useCallback(async (p = 1) => {
    setStatus("loading");
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/films?page=${p}&limit=${PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json?.message || "Erreur lors du chargement");

      setFilms(json?.data ?? []);
      setFilmCount(json?.pagination?.totalItems ?? 0);
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

          <Button onClick={() => {localStorage.removeItem("token"); window.location.reload(); }}>Se déconnecter</Button>
        </div>

        <div className="bg-gradient-to-br from-[#e7cfc7] via-[#9a92c9] to-[#2f2a73] flex justify-between gap-4 p-4 rounded-lg text-white ml-8">
          <div className="bg-[#262335] rounded-lg p-2">
            nombre de film : {filmCount}
          </div>
          <div className="flex gap-8">
            <div className="bg-[#262335] rounded-lg p-2">non Noté : 7</div>
            <div className="bg-[#262335] rounded-lg p-2">Noté : 3</div>
          </div>
        </div>

        <div>
          <h2 className="text-[#262335] font-semibold p-4 text-xl">Film à noter :</h2>

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

          {status === "loading" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {status === "idle" && error && (
            <p className="text-red-600">{error}</p>
          )}

          {status === "idle" && !error && films.length === 0 && (
            <p>Aucun film à noter pour le moment.</p>
          )}

          {status === "idle" && films.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
              {films
                .slice((page - 1) * PER_PAGE, page * PER_PAGE)
                .map((film) => (
                  <FilmCard key={film.id} film={film} apiUrl={API_URL} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}