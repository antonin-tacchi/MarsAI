import { useCallback, useEffect, useMemo, useState } from "react";
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

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
        <h3 className="text-xl font-bold text-[#262335] mb-2">
          {t("profileJury.refuseTitle")}
        </h3>
        <p className="text-sm text-[#262335]/70 mb-4">
          {film.title}
        </p>

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

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}

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

export default function ProfileJury() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [uiState, setUiState] = useState("loading");
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

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((filmCount || 0) / PER_PAGE));
  }, [filmCount]);

  const fetchFilms = useCallback(async (p = 1) => {
    setUiState("loading");
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
        totalRefused: json?.stats?.totalRefused ?? 0,
        totalUnrated: json?.stats?.totalUnrated ?? 0,
        totalRated: json?.stats?.totalRated ?? 0,
      });

      const newTotalPages = Math.max(1, Math.ceil(total / PER_PAGE));
      if (p > newTotalPages) {
        setPage(newTotalPages);

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
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Erreur profil");

        setUser(json?.data || null);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    fetchFilms(page);
  }, [page, fetchFilms]);

  const handleRefuseConfirm = () => {
    setRefuseTarget(null);
    fetchFilms(page);
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

        <div className="bg-gradient-to-br from-[#e7cfc7] via-[#9a92c9] to-[#2f2a73] flex flex-wrap justify-between gap-4 p-4 rounded-lg text-white ml-8">
          <div className="bg-[#262335] rounded-lg p-2">
            {t("profileJury.filmCount", { count: stats.totalAssigned })}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-[#262335] rounded-lg p-2">
              {t("profileJury.unrated", { count: stats.totalUnrated })}
            </div>
            <div className="bg-[#262335] rounded-lg p-2">
              {t("profileJury.rated", { count: stats.totalRated })}
            </div>
            {stats.totalRefused > 0 && (
              <div className="bg-red-900/80 rounded-lg p-2">
                {t("profileJury.refused", { count: stats.totalRefused })}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[#262335] font-semibold p-4 text-xl">
            {t("profileJury.filmsToRate")}
          </h2>

          {/* LOADING */}
          {uiState === "loading" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-12 justify-items-center">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ERROR */}
          {uiState === "error" && (
            <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto">
              <div className="text-5xl mb-4 text-red-400">&#9888;&#65039;</div>
              <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
                {t("profileJury.serverError")}
              </h2>
              <p className="text-[#262335]/70 mb-6">{error || t("profileJury.defaultError")}</p>
              <Button onClick={() => fetchFilms(page)}>{t("catalogs.retry")}</Button>
            </div>
          )}

          {/* EMPTY */}
          {uiState === "empty" && (
            <div className="max-w-2xl mx-auto p-10 rounded-[2.5rem] bg-white border border-black/5 text-center">
              <div className="text-5xl mb-4">&#127909;</div>
              <h3 className="text-2xl font-black text-[#262335] uppercase mb-2">
                {t("profileJury.nothingToRate")}
              </h3>
              <p className="text-[#262335]/70">
                {t("profileJury.noAssigned")}
              </p>
            </div>
          )}

          {/* SUCCESS */}
          {uiState === "success" && (
            <>
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

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12 text-2xl text-[#262335]">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="hover:opacity-60 disabled:opacity-30"
                    aria-label={t("profileJury.firstPage")}
                    type="button"
                  >
                    &laquo;
                  </button>

                  <button
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="hover:opacity-60 disabled:opacity-30"
                    aria-label={t("profileJury.prevPage")}
                    type="button"
                  >
                    &lsaquo;
                  </button>

                  <span className="font-black tabular-nums">{page}</span>

                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="hover:opacity-60 disabled:opacity-30"
                    aria-label={t("profileJury.nextPage")}
                    type="button"
                  >
                    &rsaquo;
                  </button>

                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="hover:opacity-60 disabled:opacity-30"
                    aria-label={t("profileJury.lastPage")}
                    type="button"
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Refuse Modal */}
      {refuseTarget && (
        <RefuseModal
          film={refuseTarget}
          onClose={() => setRefuseTarget(null)}
          onConfirm={handleRefuseConfirm}
          t={t}
        />
      )}
    </div>
  );
}
