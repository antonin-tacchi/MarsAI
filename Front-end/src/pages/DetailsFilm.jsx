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

/* Auth helper: send token only if it exists (so public routes can still work) */
function withAuthHeaders(headers = {}) {
  const token = localStorage.getItem("token");
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

/* FIX 1 : ReviewForm extrait EN DEHORS du composant parent. */
function ReviewForm({ rating, comment, onRatingChange, onCommentChange }) {
  const { t } = useLanguage();
  return (
    <div className="mt-12 flex flex-col gap-10 md:flex-row items-end mb-[69px]">
      <div className="md:flex-1">
        <h2 className="mb-4 text-[28px] font-medium text-[#262335]">
          {t("detailsFilm.giveOpinion")}
        </h2>

        <div className="w-full max-w-[600px] h-[80px] flex items-center justify-between px-[27px] bg-black/10 border border-[#262335]/10 rounded-md">
          {Array.from({ length: 10 }).map((_, i) => {
            const value = i + 1;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onRatingChange(value)}
                className="w-10 h-10 p-0 border-0 bg-transparent flex items-center justify-center focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    value <= rating ? "text-yellow-400" : "text-gray-300"
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
          {t("detailsFilm.addComment")}
        </h2>

        <div className="w-full max-w-[600px] h-[80px] p-[3px] bg-white border border-black/10">
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={t("detailsFilm.commentPlaceholder")}
            className="w-full h-full bg-black/5 border border-black/10 outline-none resize-none px-4 py-4 text-base text-[#262335] placeholder:text-[#262335]/40"
          />
        </div>
      </div>
    </div>
  );
}

/* Badge de statut du film */
const STATUS_STYLES = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  approved: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
};

const STATUS_LABEL_KEYS = {
  pending: "detailsFilm.statusPending",
  approved: "detailsFilm.statusApproved",
  rejected: "detailsFilm.statusRejected",
};

function StatusBadge({ filmStatus }) {
  const { t } = useLanguage();
  const cfg = STATUS_STYLES[filmStatus] || STATUS_STYLES.pending;
  const labelKey = STATUS_LABEL_KEYS[filmStatus] || STATUS_LABEL_KEYS.pending;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {t(labelKey)}
    </span>
  );
}

/* Panneau d'approbation / rejet */
function ApprovalPanel({
  filmStatus,
  rejectionReason,
  onReasonChange,
  onApprove,
  onReject,
  updating,
  statusMessage,
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="mt-8 rounded-xl border border-[#262335]/15 bg-[#f8f6f3] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#262335]">
          {t("detailsFilm.filmManagement")}
        </h3>
        <StatusBadge filmStatus={filmStatus} />
      </div>

      {statusMessage && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
            statusMessage.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {!showRejectForm ? (
        <div className="flex flex-wrap gap-3">
          {filmStatus !== "approved" && (
            <button
              onClick={onApprove}
              disabled={updating}
              className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {updating ? t("detailsFilm.updating") : t("detailsFilm.approve")}
            </button>
          )}
          {filmStatus !== "rejected" && (
            <button
              onClick={() => setShowRejectForm(true)}
              disabled={updating}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {t("detailsFilm.reject")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#262335]">
            {t("detailsFilm.rejectionLabel")}
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
            placeholder={t("detailsFilm.rejectionPlaceholder")}
            className="w-full rounded-lg border border-[#262335]/20 bg-white px-4 py-3 text-[#262335] placeholder:text-[#262335]/40 outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={onReject}
              disabled={updating || !rejectionReason.trim()}
              className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {updating ? t("detailsFilm.sending") : t("detailsFilm.confirmReject")}
            </button>
            <button
              onClick={() => { setShowRejectForm(false); onReasonChange(""); }}
              disabled={updating}
              className="px-5 py-2 rounded-lg border border-[#262335]/20 text-[#262335] font-medium hover:bg-black/5 transition-colors"
            >
              {t("detailsFilm.cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Bouton save extrait pour éviter la duplication mobile/desktop */
function SaveButton({ onSave, saving, saveSuccess, saveError, onNextFilm, hasNextFilm, hasVoted }) {
  const { t } = useLanguage();
  return (
    <div className="mt-4 flex flex-wrap items-center gap-4 mb-8">
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2 rounded-md bg-[#262335] text-white disabled:opacity-50"
      >
        {saving ? t("detailsFilm.saving") : t("detailsFilm.save")}
      </button>

      {hasVoted && hasNextFilm && (
        <button
          onClick={onNextFilm}
          className="px-6 py-2 rounded-md bg-[#463699] text-white hover:bg-[#362b7a] transition-colors"
        >
          Film suivant →
        </button>
      )}

      {saveSuccess && (
        <span className="text-green-600 text-sm font-medium">{t("detailsFilm.saved")}</span>
      )}
      {saveError && <span className="text-red-600 text-sm">{saveError}</span>}
    </div>
  );
}

export default function DetailsFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  /* Approval states */
  const [filmStatus, setFilmStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  /* API */
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

  const fetchFilmsPage = useCallback(
    async (page, limit, signal) => {
      const res = await fetch(
        `${API_URL}/api/films?page=${page}&limit=${limit}`,
        {
          signal,
          headers: withAuthHeaders(),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erreur films");
      return { items: data.data || [], pagination: data.pagination };
    },
    [API_URL]
  );

  const fetchAllFilms = useCallback(
    async (signal) => {
      const first = await fetchFilmsPage(1, 50, signal);
      const all = [...first.items];
      const totalPages = first.pagination?.totalPages || 1;
      for (let p = 2; p <= totalPages; p++) {
        const next = await fetchFilmsPage(p, 50, signal);
        all.push(...next.items);
      }
      return all;
    },
    [fetchFilmsPage]
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

  /* LOAD DATA */
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setRatingsLoading(true);
    setError("");

    (async () => {
      try {
        // 1) Film + suggestions (public)
        const [allFilms, filmData] = await Promise.all([
          fetchAllFilms(controller.signal),
          fetchFilmById(id, controller.signal),
        ]);

        setFilm(filmData);
        setFilmStatus(filmData.status || "pending");

        setSuggestions(
          shuffleArray(allFilms.filter((f) => String(f.id) !== String(id))).slice(
            0,
            3
          )
        );

        // 2) Stats + avis : UNIQUEMENT pour jury/admin
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

        // 3) Mon avis : seulement si jury/admin
        let myRatings = [];
        if (canReview) {
          myRatings = await fetchMyRatings(controller.signal);
          const existing = myRatings.find(
            (r) => String(r.film_id) === String(id)
          );

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

        // 4) Film suivant : trouver le prochain film non noté dans la liste assignée
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
    fetchAllFilms,
    fetchFilmById,
    fetchMyRatings,
    fetchFilmStats,
    fetchFilmRatings,
  ]);

  /* SAVE */
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

  /* STATUS CHANGE */
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

  /* DERIVED */
  const title = film?.title || "";
  const director = film?.director || "";
  const description = film?.description || "";
  const views = film?.views ?? "";
  const aiUrl = film?.film_url || film?.youtube_url || "";
  const posterUrl = film?.poster_url || "/placeholder.jpg";
  const published = useMemo(() => formatDateFR(film?.created_at), [film]);

  /* Jury section */
  const JurySection = ({ compact = false }) => (
    <section className={compact ? "mt-12" : "mt-16"}>
      <h2
        className={`text-[#262335] mb-2 ${
          compact
            ? "text-[20px] font-semibold"
            : "text-2xl font-black uppercase tracking-tight"
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
          <span className="text-sm text-[#262335]/60">
            ({stats.count || 0} avis)
          </span>
          {canReview && rating > 0 && (
            <span className="ml-3 text-sm text-[#262335]">
              • Votre note : <strong>{rating}/10</strong>
            </span>
          )}
        </div>
      )}

      {ratingsLoading && (
        <p className="text-[#262335]/60">Chargement des avis…</p>
      )}

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
              <span
                className={`text-[#262335] ${
                  compact ? "font-medium" : "font-semibold"
                }`}
              >
                {r.user_name}
              </span>
              <span className="text-sm text-yellow-500 font-bold">
                ⭐ {r.rating}/10
              </span>
            </div>

            {r.comment && (
              <p
                className={`text-[#262335]/80 ${
                  compact ? "text-sm mb-2" : "mb-3"
                }`}
              >
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
          <Link
            to={isJury ? "/profile-jury" : "/catalogs"}
            className="text-[#262335]/70 hover:text-[#262335]"
          >
            ← {isJury ? "Retour à mes films" : "Retour aux catalogues"}
          </Link>
        </div>

        {status === "loading" && <div className="text-[#262335]">Chargement…</div>}

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-red-700 font-medium">Erreur : {error}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Colonne gauche */}
            <div className="min-w-0 lg:flex-[2]">
              {/* MOBILE */}
              <div className="lg:hidden">
                <div className="w-full max-w-[387px] mx-auto">
                  <div className="w-full aspect-video">
                    <FilmPlayer
                      title={title}
                      aiUrl={aiUrl}
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

                  {/* Panneau approbation/rejet visible pour jury/admin */}
                  {canReview && (
                    <ApprovalPanel
                      filmStatus={filmStatus}
                      rejectionReason={rejectionReason}
                      onReasonChange={setRejectionReason}
                      onApprove={() => handleStatusChange("approved")}
                      onReject={() => handleStatusChange("rejected")}
                      updating={statusUpdating}
                      statusMessage={statusMessage}
                    />
                  )}

                  {/* Formulaire visible seulement pour jury/admin + film approuvé */}
                  {canReview && filmStatus === "approved" && (
                    <>
                      <ReviewForm
                        rating={rating}
                        comment={comment}
                        onRatingChange={setRating}
                        onCommentChange={setComment}
                      />
                      <SaveButton
                        onSave={saveRating}
                        saving={saving}
                        saveSuccess={saveSuccess}
                        saveError={saveError}
                        hasNextFilm={!!nextFilmId}
                        hasVoted={!!ratingId || saveSuccess}
                        onNextFilm={() => navigate(`/details-film/${nextFilmId}`)}
                      />
                    </>
                  )}

                  {/* Avis du jury visible seulement pour jury/admin + film approuvé */}
                  {canReview && filmStatus === "approved" && <JurySection compact />}
                </div>
              </div>

              {/* DESKTOP */}
              <div className="hidden lg:block">
                <div className="w-full rounded-[18px] overflow-hidden">
                  <div className="w-full aspect-video">
                    <FilmPlayer
                      title={title}
                      aiUrl={aiUrl}
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

                {/* Panneau approbation/rejet visible pour jury/admin */}
                {canReview && (
                  <ApprovalPanel
                    filmStatus={filmStatus}
                    rejectionReason={rejectionReason}
                    onReasonChange={setRejectionReason}
                    onApprove={() => handleStatusChange("approved")}
                    onReject={() => handleStatusChange("rejected")}
                    updating={statusUpdating}
                    statusMessage={statusMessage}
                  />
                )}

                {/* Formulaire visible seulement pour jury/admin + film approuvé */}
                {canReview && filmStatus === "approved" && (
                  <>
                    <ReviewForm
                      rating={rating}
                      comment={comment}
                      onRatingChange={setRating}
                      onCommentChange={setComment}
                    />
                    <SaveButton
                      onSave={saveRating}
                      saving={saving}
                      saveSuccess={saveSuccess}
                      saveError={saveError}
                      hasNextFilm={!!nextFilmId}
                      hasVoted={!!ratingId || saveSuccess}
                      onNextFilm={() => navigate(`/details-film/${nextFilmId}`)}
                    />
                  </>
                )}

                {/* Avis du jury visible seulement pour jury/admin + film approuvé */}
                {canReview && filmStatus === "approved" && <JurySection />}
              </div>
            </div>

            {/* Colonne droite — suggestions (masquée pour les jurys) */}
            {!isJury && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}
