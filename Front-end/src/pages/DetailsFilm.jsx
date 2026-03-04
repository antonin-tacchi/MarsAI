import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import FilmPlayer from "../components/FilmPlayer";
import FilmCard from "../components/FilmCard";
import { isAdminOrJury, getUserRoleIds } from "../utils/roles";
import { useLanguage } from "../context/LanguageContext";

/* utils */
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

function shuffleArray(input) {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Auth helper */
function withAuthHeaders(headers = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export default function DetailsFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const canReview = isAdminOrJury();
  const userRoles = getUserRoleIds();
  const isJury = userRoles.includes(1) || userRoles.includes(3);

  /* STATES */
  const [film, setFilm] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingId, setRatingId] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [nextFilmId, setNextFilmId] = useState(null);

  const [filmStatus, setFilmStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchFilmById = useCallback(
    async (filmId, signal) => {
      const res = await fetch(`${API_URL}/api/films/${filmId}`, {
        signal,
        headers: withAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur film");
      return data.data ?? data;
    },
    [API_URL]
  );

  const fetchSelectedFilms = useCallback(
    async (signal) => {
      const res = await fetch(`${API_URL}/api/films?all=1&status=selected`, {
        signal,
        headers: withAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur films");
      return data.data || [];
    },
    [API_URL]
  );

  const fetchMyRatings = useCallback(
    async (signal) => {
      const token = localStorage.getItem("token");
      if (!token) return [];
      const res = await fetch(`${API_URL}/api/ratings/my-ratings`, {
        signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.data || [];
    },
    [API_URL]
  );

  const fetchFilmStats = useCallback(
    async (filmId, signal) => {
      const res = await fetch(`${API_URL}/api/ratings/stats/${filmId}`, {
        signal,
        headers: withAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur stats");
      return data.data ?? data;
    },
    [API_URL]
  );

  const fetchFilmRatings = useCallback(
    async (filmId, signal) => {
      const res = await fetch(`${API_URL}/api/ratings/film/${filmId}`, {
        signal,
        headers: withAuthHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Erreur chargement avis");
      }

      const payload = data?.data ?? data;
      return Array.isArray(payload) ? payload : [];
    },
    [API_URL]
  );

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setRatingsLoading(true);
    setError("");

    (async () => {
      try {
        const [allFilms, filmData] = await Promise.all([
          fetchSelectedFilms(controller.signal),
          fetchFilmById(id, controller.signal),
        ]);

        setFilm(filmData);
        setFilmStatus(filmData.status || "pending");

        setSuggestions(
          shuffleArray(allFilms.filter((f) => String(f.id) !== String(id))).slice(0, 3)
        );

        if (canReview) {
          try {
            const [statsData, ratingsData] = await Promise.all([
              fetchFilmStats(id, controller.signal),
              fetchFilmRatings(id, controller.signal),
            ]);

            setStats(statsData);
            setRatings(Array.isArray(ratingsData) ? ratingsData : []);
          } catch {
            setStats(null);
            setRatings([]);
          } finally {
            setRatingsLoading(false);
          }
        } else {
          setStats(null);
          setRatings([]);
          setRatingsLoading(false);
        }

        let myRatings = [];
        if (canReview) {
          myRatings = await fetchMyRatings(controller.signal);
          const existing = myRatings.find((r) => String(r.film_id) === String(id));

          if (existing) {
            setRating(existing.rating);
            setComment(existing.comment || "");
            setRatingId(existing.id);
          } else {
            setRating(0);
            setComment("");
            setRatingId(null);
          }
        } else {
          setRating(0);
          setComment("");
          setRatingId(null);
        }

        if (isJury) {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(
              `${API_URL}/api/jury/assigned-films?page=1&limit=200`,
              {
                signal: controller.signal,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );
            const assigned = await res.json();
            const assignedFilms = assigned.data || [];
            const ratedIds = new Set(myRatings.map((r) => String(r.film_id)));
            const next = assignedFilms.find(
              (f) => String(f.id) !== String(id) && !ratedIds.has(String(f.id))
            );
            setNextFilmId(next ? next.id : null);
          } catch {
            setNextFilmId(null);
          }
        }

        setStatus("success");
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message);
        setStatus("error");
        setRatingsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [
    id,
    canReview,
    isJury,
    API_URL,
    fetchSelectedFilms,
    fetchFilmById,
    fetchMyRatings,
    fetchFilmStats,
    fetchFilmRatings,
  ]);

  const saveRating = async () => {
    if (!rating) {
      setSaveError(t("detailsFilm.ratingRequired"));
      return;
    }

    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("detailsFilm.loginRequired"));

      const res = await fetch(
        ratingId ? `${API_URL}/api/ratings/${ratingId}` : `${API_URL}/api/ratings`,
        {
          method: ratingId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ film_id: id, rating, comment }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (!ratingId) setRatingId(data.data.id);
      setSaveSuccess(true);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("detailsFilm.mustBeConnected"));

      const res = await fetch(`${API_URL}/api/films/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          rejection_reason: newStatus === "rejected" ? rejectionReason : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setFilmStatus(newStatus);
      setRejectionReason("");
      setStatusMessage({
        type: "success",
        text:
          newStatus === "approved"
            ? t("detailsFilm.approvedMessage")
            : t("detailsFilm.rejectedMessage"),
      });
    } catch (e) {
      setStatusMessage({ type: "error", text: e.message });
    } finally {
      setStatusUpdating(false);
    }
  };

  const title =
    lang === "en"
      ? (film?.title_english || film?.title || t("filmCard.unknownTitle"))
      : (film?.title || film?.title_english || t("filmCard.unknownTitle"));

  const director = film?.director || "";

  const description =
    lang === "en"
      ? (film?.description_english ||
          film?.description ||
          t("detailsFilm.noDescription"))
      : (film?.description ||
          film?.description_english ||
          t("detailsFilm.noDescription"));

  const views = film?.views ?? "";

  const aiUrl = film?.film_stream_url || film?.film_url || film?.youtube_url || "";

  const posterUrl = film?.poster_stream_url || film?.poster_url || "/placeholder.jpg";

  const published = useMemo(() => formatDateFR(film?.created_at), [film]);

  const JurySection = ({ compact = false }) => (
    <section className={compact ? "mt-12" : "mt-16"}>
      <h2
        className={`text-[#262335] mb-2 ${
          compact ? "text-[20px] font-semibold" : "text-2xl font-black uppercase tracking-tight"
        }`}
      >
        Avis du jury
      </h2>

      {stats && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-yellow-400">⭐</span>
          <span className="font-semibold text-[#262335]">
            {stats.average?.toFixed(1) || "—"}
          </span>
          <span className="text-sm text-[#262335]/60">({stats.count || 0} avis)</span>
          {canReview && rating > 0 && (
            <span className="ml-3 text-sm text-[#262335]">
              • Votre note : <strong>{rating}/10</strong>
            </span>
          )}
        </div>
      )}

      {ratingsLoading && <p className="text-[#262335]/60">Chargement des avis…</p>}

      {!ratingsLoading && ratings.length === 0 && (
        <p className="text-[#262335]/60 italic">Aucun avis pour le moment.</p>
      )}

      <div className={compact ? "space-y-4" : "space-y-6"}>
        {ratings.map((r) => (
          <div
            key={r.id}
            className={`border border-[#262335]/10 bg-white ${
              compact ? "rounded-xl p-4" : "rounded-2xl p-6"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[#262335] ${compact ? "font-medium" : "font-semibold"}`}>
                {r.user_name}
              </span>
              <span className="text-sm text-yellow-500 font-bold">⭐ {r.rating}/10</span>
            </div>

            {r.comment && (
              <p className={`text-[#262335]/80 ${compact ? "text-sm mb-2" : "mb-3"}`}>
                {r.comment}
              </p>
            )}

            <span className="text-xs text-[#262335]/50">
              {new Date(r.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Retour */}
        <div className="mb-6">
          <Link
            to={isJury ? "/profile-jury" : "/catalogs"}
            className="text-[#262335]/60 hover:text-[#262335] text-sm transition-colors"
          >
            ← {isJury ? t("detailsFilm.backToFilms") : t("detailsFilm.backToCatalog")}
          </Link>
        </div>

        {/* Chargement */}
        {status === "loading" && (
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <div className="lg:flex-[2] space-y-4">
              <div className="w-full aspect-video rounded-xl bg-[#262335]/10 animate-pulse" />
              <div className="h-6 bg-[#262335]/10 rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-[#262335]/10 rounded w-1/3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-[#262335]/10 rounded animate-pulse" />
                <div className="h-4 bg-[#262335]/10 rounded animate-pulse" />
                <div className="h-4 bg-[#262335]/10 rounded w-3/4 animate-pulse" />
              </div>
            </div>
            <div className="lg:w-[300px] lg:shrink-0 space-y-4">
              {[0,1,2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-[120px] h-[70px] rounded-lg bg-[#262335]/10 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#262335]/10 rounded animate-pulse" />
                    <div className="h-3 bg-[#262335]/10 rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Erreur */}
        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">Erreur : {error}</p>
          </div>
        )}

        {/* Succès */}
        {status === "success" && (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">

            {/* ── Colonne principale ── */}
            <div className="min-w-0 lg:flex-[2]">

              {/* Lecteur vidéo */}
              <div className="w-full rounded-xl overflow-hidden shadow-md">
                <div className="w-full aspect-video">
                  <FilmPlayer
                    title={title}
                    aiUrl={aiUrl}
                    thumbnailUrl={film?.thumbnail_stream_url || film?.thumbnail_url}
                    posterUrl={film?.poster_stream_url || film?.poster_url}
                    apiUrl={API_URL}
                  />
                </div>
              </div>

              {/* Titre */}
              <h1 className="mt-5 text-xl sm:text-2xl font-semibold text-[#262335] leading-tight">
                {title}
              </h1>

              {/* Réalisateur + pays */}
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-[#262335] truncate">
                      {film?.director_firstname} {film?.director_lastname}
                    </p>
                    {film?.country && (
                      <p className="text-xs text-[#262335]/50">{film.country}</p>
                    )}
                  </div>
                </div>
                {film?.director_school && (
                  <p className="shrink-0 text-sm text-[#262335]/60 italic">{film.director_school}</p>
                )}
              </div>

              {/* Date + description */}
              <div className="mt-5 border-t border-[#262335]/10 pt-5">
                {published && (
                  <p className="text-sm font-medium text-[#262335]/60 mb-3">
                    Publié le {published}
                  </p>
                )}
                <p className="text-[15px] text-[#262335]/80 leading-relaxed whitespace-pre-line max-w-[75ch]">
                  {description}
                </p>
              </div>

              {/* Outils IA */}
              {film?.ai_tools_used && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {film.ai_tools_used.split(",").map((tool) => tool.trim()).filter(Boolean).map((tool) => (
                    <span key={tool} className="text-xs px-3 py-1 rounded-full bg-[#463699]/10 text-[#463699] font-medium">
                      {tool}
                    </span>
                  ))}
                </div>
              )}


            </div>

            {/* ── Suggestions ── */}
            {suggestions.length > 0 && (
              <aside className="w-full lg:w-[260px] lg:shrink-0 pt-0 lg:pt-2 flex flex-row lg:flex-col gap-6 lg:gap-8 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {suggestions.map((s) => (
                  <div key={`sug-${id}-${s.id}`} className="shrink-0 lg:shrink">
                    <FilmCard film={s} apiUrl={API_URL} imageVariant="auto" />
                  </div>
                ))}
              </aside>
            )}

          </div>
        )}
      </div>
    </div>
  );
}