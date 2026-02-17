import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import FilmCard from "../components/FilmCard";
import Button from "../components/Button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const SkeletonCard = () => (
  <div className="block w-[260px]">
    <div className="w-full h-[160px] rounded-lg animate-shimmer mb-4" />
    <div className="h-6 animate-shimmer rounded w-3/4 mb-2" />
    <div className="h-4 animate-shimmer rounded w-1/2" />
  </div>
);

const RankBadge = ({ rank }) => {
  const colors = {
    1: "from-yellow-400 to-yellow-600",
    2: "from-gray-300 to-gray-500",
    3: "from-amber-600 to-amber-800",
  };
  const gradient = colors[rank] || "from-[#9a92c9] to-[#2f2a73]";

  return (
    <div
      className={`absolute top-2 left-2 bg-gradient-to-r ${gradient} text-white text-sm font-bold w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-10`}
    >
      {rank}
    </div>
  );
};

export default function PrizeList() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const fetchResults = useCallback(async () => {
    setStatus("loading");
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("auth");
      setStatus("idle");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/jury/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setError("auth");
        } else {
          throw new Error(data?.message || "Erreur lors du chargement");
        }
        setStatus("idle");
        return;
      }

      setRanking(data?.data || []);
      setStatus("idle");
    } catch (err) {
      setError("Impossible de charger le classement.");
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <main className="min-h-screen bg-[#FBF5F0] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#262335] uppercase tracking-tighter mb-2 p-6 italic">
            Classement des films
          </h1>
          <p className="text-[#262335]/60 px-6">
            Films class&eacute;s par moyenne des notes du jury
          </p>
        </header>

        {/* --- ERREUR AUTH --- */}
        {error === "auth" && (
          <div className="flex flex-col items-center justify-center p-10 bg-white border-2 border-[#262335]/10 rounded-[2.5rem] text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4 opacity-30">🔒</div>
            <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
              Acc&egrave;s r&eacute;serv&eacute;
            </h2>
            <p className="text-[#262335]/70 mb-6">
              Connectez-vous en tant que membre du jury pour voir le classement.
            </p>
            <Link to="/login">
              <Button>Se connecter</Button>
            </Link>
          </div>
        )}

        {/* --- ERREUR SERVEUR --- */}
        {error && error !== "auth" && (
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4 text-red-400">⚠️</div>
            <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
              Erreur Serveur
            </h2>
            <p className="text-[#262335]/70 mb-6">{error}</p>
            <Button onClick={fetchResults}>R&eacute;essayer</Button>
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

        {/* --- VIDE --- */}
        {status === "idle" && !error && ranking.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#262335]/10 rounded-[2.5rem] bg-[#FBF5F0]/50">
            <div className="text-6xl mb-6 opacity-30">🏆</div>
            <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
              Aucun film not&eacute; pour le moment
            </h2>
          </div>
        )}

        {/* --- CLASSEMENT --- */}
        {status === "idle" && !error && ranking.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
            {ranking.map((film) => (
              <div key={film.film_id} className="relative">
                <RankBadge rank={film.rank} />

                <FilmCard
                  film={{
                    id: film.film_id,
                    title: film.title,
                    director_firstname: film.director?.split(" ")[0] || "",
                    director_lastname:
                      film.director?.split(" ").slice(1).join(" ") || "",
                    thumbnail_url: film.thumbnail_url,
                    poster_url: film.poster_url,
                  }}
                  apiUrl={API_URL}
                />

                {/* Badge moyenne */}
                <div className="flex items-center gap-3 mt-1 px-1">
                  {film.average_rating !== null ? (
                    <span className="text-sm font-bold text-[#463699]">
                      {film.average_rating}/10
                    </span>
                  ) : (
                    <span className="text-sm text-[#262335]/40 italic">
                      Pas encore not&eacute;
                    </span>
                  )}
                  <span className="text-xs text-[#262335]/50">
                    {film.rating_count} vote{film.rating_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
