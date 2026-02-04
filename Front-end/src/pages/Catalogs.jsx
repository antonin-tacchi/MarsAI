import { useEffect, useState, useCallback } from "react";
import FilmCard from "../components/FilmCard";
import SearchBar from "../components/SearchBar";
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

export default function Catalogs() {
  const [films, setFilms] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading"); // On commence en loading
  const [error, setError] = useState("");

  const fetchFilms = useCallback(async (p) => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/films?page=${p}&limit=${PER_PAGE}`,
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data?.message || "Erreur lors du chargement");

      setFilms(data?.data || []);
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setError("Impossible de se connecter au serveur.");
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    fetchFilms(page);
  }, [page, fetchFilms]);

  // Filtrage local simple pour la démo (UX réactive)
  const filteredFilms = films.filter((f) =>
    f.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#FBF5F0] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-[#262335] uppercase tracking-tighter mb-8 italic">
            Catalogue
          </h1>
          <SearchBar value={query} onChange={setQuery} />
        </header>

        {/* --- 1. ÉTAT ERREUR API --- */}
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

        {/* --- 2. ÉTAT CHARGEMENT (SKELETONS) --- */}
        {status === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* --- GESTION DES ÉTATS VIDES ET RECHERCHE --- */}
        {status === "idle" && !error && filteredFilms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#262335]/10 rounded-[2.5rem] bg-[#FBF5F0]/50">
            <div className="text-6xl mb-6 opacity-30">
              {query ? "🔍" : "🎬"}
            </div>

            {query ? (
              /* MESSAGE : Aucun résultat pour la recherche */
              <>
                <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
                  Aucun résultat pour cette recherche
                </h2>
                <p className="mt-4 text-[#262335]/60 max-w-md mx-auto">
                  Nous n'avons trouvé aucun film correspondant à "
                  <span className="font-bold text-[#262335]">{query}</span>".
                </p>
                <Button onClick={() => setQuery("")} className="mt-8 scale-90">
                  Effacer la recherche
                </Button>
              </>
            ) : (
              /* MESSAGE : Catalogue totalement vide */
              <>
                <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
                  Aucun film dans le catalogue
                </h2>
                <p className="mt-4 text-[#262335]/60 max-w-md mx-auto">
                  La pellicule est vide pour le moment. Revenez bientôt !
                </p>
              </>
            )}
          </div>
        )}

        {/* --- 4. ÉTAT SUCCÈS (AFFICHAGE DES FILMS) --- */}
        {status === "idle" && filteredFilms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
            {filteredFilms.map((film) => (
              <FilmCard key={film.id} film={film} apiUrl={API_URL} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
