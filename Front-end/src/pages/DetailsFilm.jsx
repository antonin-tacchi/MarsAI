import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FilmPlayer from "../components/FilmPlayer";
import FilmCard from "../components/FilmCard";
import { isAdminOrJury } from "../utils/roles";

function formatDateFR(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Fisher–Yates shuffle (vrai random)
function shuffleArray(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DetailsFilm() {
  const { id } = useParams();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const [film, setFilm] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const fetchFilmById = useCallback(
    async (filmId, signal) => {
      const res = await fetch(`${API_URL}/api/films/${filmId}`, { signal });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.message || `Failed to load film ${filmId}`;
        const err = new Error(msg);
        err.status = res.status;
        throw err;
      }

      return data?.data ?? data;
    },
    [API_URL]
  );

  // Récupère 1 page + pagination
  const fetchFilmsPage = useCallback(
    async (page, limit, signal) => {
      const res = await fetch(
        `${API_URL}/api/films?page=${page}&limit=${limit}`,
        { signal }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load films");
      return {
        items: Array.isArray(data?.data) ? data.data : [],
        pagination: data?.pagination || null,
      };
    },
    [API_URL]
  );

  // Récupère TOUS les films (toutes pages)
  const fetchAllFilms = useCallback(
    async (signal) => {
      const LIMIT = 50; // augmente si tu veux (ex: 100)
      const MAX_PAGES_SAFETY = 200; // anti-boucle infinie

      const first = await fetchFilmsPage(1, LIMIT, signal);
      const all = [...first.items];

      const totalPages =
        Number(first.pagination?.totalPages) ||
        Number(first.pagination?.total_pages) ||
        1;

      const safeTotal = Math.min(totalPages, MAX_PAGES_SAFETY);

      for (let p = 2; p <= safeTotal; p++) {
        const next = await fetchFilmsPage(p, LIMIT, signal);
        all.push(...next.items);
      }

      // dédoublonnage par id au cas où
      const map = new Map();
      for (const f of all) map.set(String(f?.id), f);
      return Array.from(map.values());
    },
    [fetchFilmsPage]
  );

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setStatus("loading");
    setError("");
    setFilm(null);
    setSuggestions([]);
    setComment("");
    setRating(0);

    (async () => {
      try {
        // 1) Récupérer TOUS les films (pour suggestions + fallback)
        const allFilms = await fetchAllFilms(controller.signal);

        // 2) Film principal
        let f = null;
        try {
          f = await fetchFilmById(id, controller.signal);
        } catch (e) {
          // fallback si /:id n'existe pas côté backend
          f = allFilms.find((x) => String(x?.id) === String(id)) || null;
          if (!f) {
            throw new Error(
              "Film introuvable (route /:id absente et pas trouvé dans la BDD via listing)."
            );
          }
        }

        if (!isMounted) return;
        setFilm(f);

        // 3) Suggestions: 3 films au hasard dans TOUTE la BDD (sans le film courant)
        const pool = allFilms.filter((x) => String(x?.id) !== String(id));
        const sug = shuffleArray(pool).slice(0, 3);

        if (!isMounted) return;
        setSuggestions(sug);

        setStatus("success");
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
  }, [id, fetchAllFilms, fetchFilmById]);

  const title = film?.title || "Titre de la vidéo";
  const director =
    `${film?.director_firstname || ""} ${film?.director_lastname || ""}`.trim() ||
    "Nom de la chaîne";

  const aiUrl = film?.film_url || film?.video_url || film?.ai_url || "";

  // Pour le player principal : ok de garder un fallback visuel si pas d'image
  const posterUrl =
    film?.poster_url || film?.thumbnail_url || "https://picsum.photos/1200/675";

  const published = useMemo(
    () => formatDateFR(film?.created_at),
    [film?.created_at]
  );

  const description =
    film?.description ||
    "Aucune description pour le moment. (Le film garde le mystère, c’est son arc narratif.)";

  const views = film?.views ? `${film.views} vues` : "Vues";

  const canReview = isAdminOrJury();

  return (
    <div className="bg-white">
      <div
        className="
          mx-auto max-w-7xl
          px-4 sm:px-6
          lg:pl-8 lg:pr-16
          py-8 sm:py-10
        "
      >
        <div className="mb-6">
          <Link to="/catalogs" className="text-[#262335]/70 hover:text-[#262335]">
            ← Retour aux catalogues
          </Link>
        </div>

        {status === "loading" && (
          <div className="text-[#262335]">Chargement…</div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">Erreur : {error}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* left column */}
            <div className="min-w-0 lg:flex-[2]">
              {/* MOBILE */}
              <div className="lg:hidden">
                <div className="w-full max-w-[387px] mx-auto">
                  <div className="w-full aspect-video">
                    <FilmPlayer
                      title={film?.title}
                      aiUrl={film?.film_url}
                      youtubeUrl={film?.youtube_url}
                      thumbnailUrl={film?.thumbnail_url}
                      posterUrl={film?.poster_url}
                      apiUrl={API_URL}
                    />

                  </div>

                  <div className="mt-6">
                    <p className="text-[24px] font-semibold text-[#262335] leading-tight">
                      {title}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-6">
                      <div className="min-w-0 flex items-center gap-4">
                        <div className="w-[56px] h-[56px] shrink-0 rounded-full bg-black/10 border border-[#262335]/10 overflow-hidden">
                          <img
                            src={posterUrl}
                            alt={director}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                          />
                        </div>

                        <p className="text-[16px] font-medium text-[#262335] truncate">
                          {director}
                        </p>
                      </div>

                      <p className="shrink-0 text-[16px] font-medium text-[#262335]">
                        {views}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[16px] font-medium text-[#262335]">
                      {published ? `Publié le ${published}` : "Date de publication"}
                    </p>

                    <p className="mt-3 max-w-[80ch] text-[16px] text-[#262335]/80 leading-relaxed whitespace-pre-line">
                      {description}
                    </p>
                  </div>

                  {canReview && (
                  <div className="mt-12 mb-16 flex flex-col gap-10 md:flex-row md:items-end">
                    <div className="md:flex-1 min-w-0">
                      <h2 className="mb-4 text-[16px] font-medium text-[#262335]">
                        Donnez votre avis
                      </h2>

                      <div className="w-full h-[46px] px-4 bg-black/10 border border-[#262335]/10 rounded-md flex items-center">
                        <div className="grid grid-cols-10 gap-2 w-full">
                          {Array.from({ length: 10 }).map((_, i) => {
                            const value = i + 1;
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setRating(value)}
                                className="w-8 h-8 flex items-center justify-center bg-transparent border-0 p-0 focus:outline-none"
                              >
                                <svg
                                  className={`w-6 h-6 ${
                                    value <= rating ? "text-yellow-400" : "text-white"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.381-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95.69l1.286-3.97z" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="md:flex-1 min-w-0">
                      <h2 className="mb-4 text-[16px] font-medium text-[#262335]">
                        Ajoutez un commentaire...
                      </h2>

                      <div className="w-full h-[80px] p-[3px] bg-white border border-black/10">
                        <textarea
                          name="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Votre commentaire..."
                          className="w-full h-full bg-black/5 border border-black/10 outline-none resize-none px-4 py-4 text-[16px] text-[#262335] placeholder:text-[#262335]/40"
                        />
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {/* DESKTOP */}
              <div className="hidden lg:block">
                <div className="w-full rounded-[18px] overflow-hidden">
                  <div className="w-full aspect-video">
                    <FilmPlayer
                      title={title}
                      aiUrl={aiUrl}
                      youtubeUrl={film?.youtube_url}
                      thumbnailUrl={film?.thumbnail_url}
                      posterUrl={film?.poster_url}
                      apiUrl={API_URL}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <p className="text-lg font-medium">{title}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <p className="text-lg font-medium truncate">{director}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-base font-medium text-[#262335]">
                    {published ? `Publié le ${published}` : "Date de publication"}
                  </p>

                  <p className="mt-3 max-w-[80ch] text-base text-[#262335]/80 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>

                {canReview && (
                <div className="mt-12 flex flex-col gap-10 md:flex-row items-end mb-[69px]">
                  <div className="md:flex-1">
                    <h2 className="mb-4 text-[28px] font-medium text-[#262335]">
                      Donnez votre avis
                    </h2>

                    <div className="w-[600px] h-[80px] flex items-center justify-between px-[27px] bg-black/10 border border-[#262335]/10 rounded-md">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const value = i + 1;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setRating(value)}
                            className="w-10 h-10 p-0 border-0 bg-transparent flex items-center justify-center focus:outline-none"
                          >
                            <svg
                              className={`w-10 h-10 ${
                                value <= rating ? "text-yellow-400" : "text-white"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.381-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95.69l1.286-3.97z" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="md:flex-1">
                    <h2 className="mb-4 text-[28px] font-medium text-[#262335]">
                      Ajoutez un commentaire...
                    </h2>

                    <div className="w-[600px] h-[80px] max-w-full p-[3px] bg-white border border-black/10">
                      <textarea
                        name="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Votre commentaire..."
                        className="w-full h-full bg-black/5 border border-black/10 outline-none resize-none px-4 py-4 text-base text-[#262335] placeholder:text-[#262335]/40"
                      />
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <aside
              className="
                w-full
                max-w-[300px]
                mx-auto
                pt-2
                space-y-5
                lg:w-[300px]
                lg:shrink-0
                lg:mx-0
              "
            >
              {suggestions.map((s) => (
                <div
                  key={`sug-${id}-${s.id}`}
                  className="
                    max-w-[260px]
                    mx-auto
                    [&>a]:w-full

                    [&_.relative]:aspect-video
                    [&_.relative]:h-auto

                    [&_img]:h-full
                    [&_img]:w-full
                    [&_img]:object-cover

                    [&_p:first-of-type]:text-[14px]
                    [&_p:first-of-type]:leading-snug
                    [&_p:last-of-type]:text-[12px]
                    [&_p:first-of-type]:mt-1
                  "
                >
                  <FilmCard film={s} apiUrl={API_URL} imageVariant="thumbnail" />
                </div>
              ))}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
