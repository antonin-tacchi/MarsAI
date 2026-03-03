// src/pages/ProfileJury.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaThLarge, FaList, FaArrowLeft } from "react-icons/fa";
import FilmCard from "../components/FilmCard";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const PER_PAGE = 20;

const SkeletonCard = () => (
  <div className="block w-[260px]">
    <div className="w-full h-[160px] rounded-lg animate-shimmer mb-4" />
    <div className="h-6 animate-shimmer rounded w-3/4 mb-2" />
    <div className="h-4 animate-shimmer rounded w-1/2" />
  </div>
);

function RefuseModal({ film, onClose, onConfirm, t }) {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSending(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/jury/films/${film.id}/refuse`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Erreur");
      onConfirm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-xl font-bold text-[#262335] mb-2">{t("profileJury.refuseTitle")}</h3>
        <p className="text-sm text-[#262335]/70 mb-4">{film.title}</p>

        <label className="block text-sm font-medium text-[#262335] mb-2">
          {t("profileJury.refuseReasonLabel")}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder={t("profileJury.refuseReasonPlaceholder")}
          className="w-full rounded-lg border border-[#262335]/20 bg-white px-4 py-3 text-[#262335] placeholder:text-[#262335]/40 outline-none focus:ring-2 focus:ring-red-300 resize-none"
        />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={sending || !reason.trim()}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {sending ? t("profileJury.refusing") : t("profileJury.confirmRefuse")}
          </button>
          <button
            onClick={onClose}
            disabled={sending}
            className="px-5 py-2 rounded-lg border border-[#262335]/20 text-[#262335] font-medium hover:bg-black/5 transition-colors"
          >
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilmRow({ film, apiUrl, onRefuse, t }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-[#262335]/5 hover:border-[#463699]/30 transition-colors">
      <a href={`/details-film/${film?.id ?? ""}`} className="shrink-0 w-24 h-14 rounded-lg overflow-hidden bg-[#C7C2CE]">
        <img
          src={
            film?.thumbnail_url
              ? film.thumbnail_url.startsWith("http")
                ? film.thumbnail_url
                : `${apiUrl}${film.thumbnail_url}`
              : "/placeholder.jpg"
          }
          alt={film?.title || ""}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />
      </a>

      <a href={`/details-film/${film?.id ?? ""}`} className="flex-1 min-w-0">
        <p className="font-semibold text-[#262335] truncate">{film?.title}</p>
        <p className="text-sm text-[#262335]/70 truncate">
          {film?.director_firstname} {film?.director_lastname}
          {film?.country && <span className="ml-2 text-[#262335]/50">({film.country})</span>}
        </p>
      </a>

      <div className="flex items-center gap-3 shrink-0">
        {film?.user_rating !== null && film?.user_rating !== undefined ? (
          <span className="bg-gradient-to-r from-[#9a92c9] to-[#2f2a73] text-white text-sm font-bold px-3 py-1 rounded-full">
            {film.user_rating}/10
          </span>
        ) : (
          <button
            onClick={() => onRefuse(film)}
            className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            {t("profileJury.refuseButton")}
          </button>
        )}

        {film?.average_rating != null && (
          <span className="text-sm font-bold text-[#463699]">{film.average_rating}/10</span>
        )}
      </div>
    </div>
  );
}

export default function ProfileJury() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [view, setView] = useState({ type: "lists" }); // {type:'lists'} or {type:'films', listId, listName}
  const [viewMode, setViewMode] = useState("grid"); // grid|list

  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState("");

  const [uiState, setUiState] = useState("idle"); // idle|loading|success|empty|error
  const [error, setError] = useState("");
  const [films, setFilms] = useState([]);
  const [filmCount, setFilmCount] = useState(0);
  const [page, setPage] = useState(1);

  const [refuseTarget, setRefuseTarget] = useState(null);

  const [stats, setStats] = useState({
    totalAssigned: 0,
    totalRefused: 0,
    totalUnrated: 0,
    totalRated: 0,
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((filmCount || 0) / PER_PAGE)),
    [filmCount]
  );

  // Profile
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => null);
        if (res.ok) setUser(json?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [token]);

  const fetchLists = useCallback(async () => {
    setListsLoading(true);
    setListsError("");
    try {
      const res = await fetch(`${API_URL}/api/jury/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setLists(json?.data || []);
    } catch (err) {
      console.error("fetchLists:", err);
      setListsError(err.message);
      setLists([]);
    } finally {
      setListsLoading(false);
    }
  }, [token]);

  const fetchFilms = useCallback(
    async (p = 1, listId) => {
      setUiState("loading");
      setError("");

      try {
        const params = new URLSearchParams({ page: p, limit: PER_PAGE });
        if (listId) params.set("list_id", String(listId));

        const res = await fetch(`${API_URL}/api/jury/assigned-films?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.message || "Erreur");

        const items = json?.data ?? [];
        const total = json?.pagination?.totalItems ?? 0;

        setFilms(items);
        setFilmCount(total);
        setStats({
          totalAssigned: json?.stats?.totalAssigned ?? 0,
          totalRefused: json?.stats?.totalRefused ?? 0,
          totalUnrated: json?.stats?.totalUnrated ?? 0,
          totalRated: json?.stats?.totalRated ?? 0,
        });

        const tp = Math.max(1, Math.ceil(total / PER_PAGE));
        if (p > tp) {
          setPage(tp);
          return;
        }

        setUiState(items.length === 0 ? "empty" : "success");
      } catch (err) {
        console.error(err);
        setError("Impossible de se connecter au serveur.");
        setFilms([]);
        setFilmCount(0);
        setStats({ totalAssigned: 0, totalRefused: 0, totalUnrated: 0, totalRated: 0 });
        setUiState("error");
      }
    },
    [token]
  );

  // Lists load
  useEffect(() => {
    if (view.type === "lists") fetchLists();
  }, [view.type, fetchLists]);

  // Films load
  useEffect(() => {
    if (view.type === "films" && view.listId) fetchFilms(page, view.listId);
  }, [view, page, fetchFilms]);

  const openList = (list) => {
    setPage(1);
    setView({ type: "films", listId: list.id, listName: list.name });
  };

  const backToLists = () => {
    setView({ type: "lists" });
    setFilms([]);
    setPage(1);
    setUiState("idle");
  };

  const onRefuseConfirm = () => {
    setRefuseTarget(null);
    if (view.type === "films") fetchFilms(page, view.listId);
  };

  if (profileLoading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <h1>{t("profileJury.loading")}</h1>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-4 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-[#262335]">
            {t("profileJury.greeting", { name: user?.name || t("profileJury.defaultName") })}
          </h1>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            {t("profileJury.logout")}
          </Button>
        </div>

        {/* LISTS VIEW */}
        {view.type === "lists" && (
          <div>
            <h2 className="text-[#262335] font-semibold p-4 text-xl">{t("profileJury.myLists")}</h2>

            {listsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-[#262335]/5 animate-pulse">
                    <div className="h-5 bg-[#C7C2CE] rounded w-1/3 mb-3" />
                    <div className="h-4 bg-[#C7C2CE] rounded w-2/3 mb-4" />
                    <div className="flex gap-2 mb-3">
                      <div className="h-6 bg-[#C7C2CE] rounded-full w-16" />
                      <div className="h-6 bg-[#C7C2CE] rounded-full w-16" />
                    </div>
                    <div className="h-2 bg-[#C7C2CE] rounded-full w-full" />
                  </div>
                ))}
              </div>
            )}

            {!listsLoading && listsError && (
              <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">{t("profileJury.serverError")}</h2>
                <p className="text-[#262335]/70 mb-6">{listsError}</p>
                <Button onClick={fetchLists}>{t("catalogs.retry")}</Button>
              </div>
            )}

            {!listsLoading && !listsError && lists.length === 0 && (
              <div className="max-w-2xl mx-auto p-10 rounded-[2.5rem] bg-white border border-black/5 text-center">
                <h3 className="text-2xl font-black text-[#262335] uppercase mb-2">{t("profileJury.noLists")}</h3>
                <p className="text-[#262335]/70">{t("profileJury.noListsDesc")}</p>
              </div>
            )}

            {!listsLoading && !listsError && lists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lists.map((list) => {
                  const total = list.film_count || 0;
                  const rated = list.rated_count || 0;
                  const unrated = list.unrated_count || 0;
                  const progress = total > 0 ? Math.round((rated / total) * 100) : 0;

                  return (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => openList(list)}
                      className="bg-white rounded-2xl p-5 border border-[#262335]/5 hover:border-[#463699]/40 hover:shadow-md transition-all text-left group"
                    >
                      <h3 className="text-lg font-bold text-[#262335] group-hover:text-[#463699] transition-colors mb-1">
                        {list.name}
                      </h3>
                      {list.description && <p className="text-sm text-[#262335]/60 mb-3 line-clamp-2">{list.description}</p>}

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-[#262335] text-white text-xs font-bold px-3 py-1 rounded-full">{total} films</span>
                        {rated > 0 && (
                          <span className="bg-[#463699] text-white text-xs font-bold px-3 py-1 rounded-full">
                            {rated} {t("profileJury.ratedLabel")}
                          </span>
                        )}
                        {unrated > 0 && (
                          <span className="bg-[#262335]/10 text-[#262335] text-xs font-bold px-3 py-1 rounded-full">
                            {unrated} {t("profileJury.unratedLabel")}
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-[#262335]/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#463699] to-[#9a92c9] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-[#262335]/50 mt-1">
                        {progress}% {t("profileJury.completed")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FILMS VIEW */}
        {view.type === "films" && (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={backToLists}
                  className="flex items-center gap-2 text-[#463699] hover:text-[#262335] font-medium transition-colors"
                >
                  <FaArrowLeft /> {t("profileJury.backToLists")}
                </button>
                <h2 className="text-xl font-bold text-[#262335]">{view.listName}</h2>
              </div>

              <div className="flex bg-[#262335]/10 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === "grid" ? "bg-[#262335] text-white" : "text-[#262335] hover:bg-[#262335]/10"
                  }`}
                >
                  <FaThLarge size={14} /> {t("profileJury.gridView")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-1.5 ${
                    viewMode === "list" ? "bg-[#262335] text-white" : "text-[#262335] hover:bg-[#262335]/10"
                  }`}
                >
                  <FaList size={14} /> {t("profileJury.listView")}
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#e7cfc7] via-[#9a92c9] to-[#2f2a73] flex flex-wrap justify-between gap-4 p-4 rounded-lg text-white">
              <div className="bg-[#262335] rounded-lg p-2">{t("profileJury.filmCount", { count: stats.totalAssigned })}</div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-[#262335] rounded-lg p-2">{t("profileJury.unrated", { count: stats.totalUnrated })}</div>
                <div className="bg-[#262335] rounded-lg p-2">{t("profileJury.rated", { count: stats.totalRated })}</div>
                {stats.totalRefused > 0 && (
                  <div className="bg-red-900/80 rounded-lg p-2">{t("profileJury.refused", { count: stats.totalRefused })}</div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-[#262335] font-semibold p-4 text-xl">{t("profileJury.filmsToRate")}</h2>

              {uiState === "loading" && viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
                  {[...Array(8)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {uiState === "loading" && viewMode === "list" && (
                <div className="flex flex-col gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl animate-pulse">
                      <div className="w-24 h-14 rounded-lg bg-[#C7C2CE]" />
                      <div className="flex-1">
                        <div className="h-5 bg-[#C7C2CE] rounded w-1/3 mb-2" />
                        <div className="h-4 bg-[#C7C2CE] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {uiState === "error" && (
                <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">{t("profileJury.serverError")}</h2>
                  <p className="text-[#262335]/70 mb-6">{error || t("profileJury.defaultError")}</p>
                  <Button onClick={() => fetchFilms(page, view.listId)}>{t("catalogs.retry")}</Button>
                </div>
              )}

              {uiState === "empty" && (
                <div className="max-w-2xl mx-auto p-10 rounded-[2.5rem] bg-white border border-black/5 text-center">
                  <h3 className="text-2xl font-black text-[#262335] uppercase mb-2">{t("profileJury.nothingToRate")}</h3>
                  <p className="text-[#262335]/70">{t("profileJury.noAssigned")}</p>
                </div>
              )}

              {uiState === "success" && viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
                  {films.map((film) => (
                    <div key={film.id} className="flex flex-col items-center w-[260px]">
                      <FilmCard film={film} apiUrl={API_URL} />
                      {!film.user_rating && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setRefuseTarget(film);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                          {t("profileJury.refuseButton")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uiState === "success" && viewMode === "list" && (
                <div className="flex flex-col gap-2">
                  {films.map((film) => (
                    <FilmRow key={film.id} film={film} apiUrl={API_URL} onRefuse={setRefuseTarget} t={t} />
                  ))}
                </div>
              )}

              {uiState === "success" && totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 text-2xl text-[#262335]">
                  <button onClick={() => setPage(1)} disabled={page === 1} className="hover:opacity-60 disabled:opacity-30" type="button">
                    &laquo;
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="hover:opacity-60 disabled:opacity-30"
                    type="button"
                  >
                    &lsaquo;
                  </button>
                  <span className="font-black tabular-nums">{page}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="hover:opacity-60 disabled:opacity-30"
                    type="button"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="hover:opacity-60 disabled:opacity-30"
                    type="button"
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {refuseTarget && (
        <RefuseModal film={refuseTarget} onClose={() => setRefuseTarget(null)} onConfirm={onRefuseConfirm} t={t} />
      )}
    </div>
  );
}