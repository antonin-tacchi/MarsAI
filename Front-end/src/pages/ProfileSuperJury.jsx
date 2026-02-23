import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ProfileSuperJury() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Distribution state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [R, setR] = useState(3);
  const [Lmax, setLmax] = useState(70);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [distResult, setDistResult] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("films");

  // Lists state
  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState("");
  const [openList, setOpenList] = useState(null);
  const [openListLoading, setOpenListLoading] = useState(false);

  // Film management state
  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const [filmFilter, setFilmFilter] = useState("pending");
  const [filmPage, setFilmPage] = useState(1);
  const [filmPagination, setFilmPagination] = useState(null);

  // Rejection modal
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setUser(json?.data || null);
    } catch (err) {
      console.error("Profile error:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setStats(json.data);
    } catch (err) {
      console.error("Stats error:", err);
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  const fetchFilms = useCallback(async (page = 1, status = "pending") => {
    setFilmsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set("status", status);
      const res = await fetch(`${API_URL}/api/admin/films?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setFilms(json.data || []);
      setFilmPagination(json.pagination || null);
    } catch (err) {
      console.error("Films error:", err);
      setFilms([]);
    } finally {
      setFilmsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (activeTab === "films") fetchFilms(filmPage, filmFilter);
  }, [activeTab, filmPage, filmFilter, fetchFilms]);

  useEffect(() => {
    if (activeTab === "repartition") fetchStats();
  }, [activeTab, fetchStats]);

  const fetchLists = useCallback(async () => {
    setListsLoading(true);
    setListsError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setLists(json.data || []);
    } catch (err) {
      console.error("Lists error:", err);
      setListsError(err.message);
    } finally {
      setListsLoading(false);
    }
  }, [token]);

  const fetchListById = useCallback(async (listId) => {
    setOpenListLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setOpenList(json.data);
    } catch (err) {
      console.error("List detail error:", err);
    } finally {
      setOpenListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === "lists") { setOpenList(null); fetchLists(); }
  }, [activeTab, fetchLists]);

  const handleStatusChange = async (filmId, status, reason) => {
    setActionLoading(filmId);
    try {
      const body = { status };
      if (reason) body.rejection_reason = reason;

      const res = await fetch(`${API_URL}/api/admin/films/${filmId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");

      fetchFilms(filmPage, filmFilter);
      fetchStats();
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      console.error("Status change error:", err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreview(null);
    setDistResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ R, Lmax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setPreview(json.data);
    } catch (err) {
      console.error("Preview error:", err);
      setStatsError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setDistResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ R, Lmax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setDistResult(json.data);
      setPreview(null);
      fetchStats();
    } catch (err) {
      console.error("Generate error:", err);
      setStatsError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#262335]">{t("profileSuperJury.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#262335]">
            {t("profileSuperJury.title", {
              name: user?.name || t("profileSuperJury.defaultName"),
            })}
          </h1>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            {t("profileSuperJury.logout")}
          </Button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "films", label: "Films" },
            { key: "repartition", label: t("profileSuperJury.currentState") },
            { key: "lists", label: "Listes" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                activeTab === key
                  ? "bg-[#262335] text-white"
                  : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Film management ── */}
        {activeTab === "films" && (
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#262335] mb-4">
            Gestion des films
          </h2>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {["pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setFilmFilter(s); setFilmPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${
                  filmFilter === s
                    ? "bg-[#262335] text-white"
                    : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"
                }`}
              >
                {s === "pending" ? "En attente" : s === "approved" ? "Approuves" : "Refuses"}
              </button>
            ))}
          </div>

          {filmsLoading ? (
            <p className="text-[#262335]/50">Chargement...</p>
          ) : films.length === 0 ? (
            <p className="text-[#262335]/50 italic">Aucun film avec ce statut.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#262335]/10">
                    <th className="py-3 px-3 font-bold text-[#262335]">Titre</th>
                    <th className="py-3 px-3 font-bold text-[#262335]">Realisateur</th>
                    <th className="py-3 px-3 font-bold text-[#262335]">Pays</th>
                    <th className="py-3 px-3 font-bold text-[#262335] text-center">Statut</th>
                    <th className="py-3 px-3 font-bold text-[#262335] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {films.map((film) => (
                    <tr key={film.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                      <td className="py-3 px-3 text-[#262335] font-medium">{film.title}</td>
                      <td className="py-3 px-3 text-[#262335]">
                        {film.director_firstname} {film.director_lastname}
                      </td>
                      <td className="py-3 px-3 text-[#262335]">{film.country}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[film.status] || ""}`}>
                          {film.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex gap-2 justify-center">
                          {film.status !== "approved" && (
                            <button
                              type="button"
                              disabled={actionLoading === film.id}
                              onClick={() => handleStatusChange(film.id, "approved")}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                            >
                              Approuver
                            </button>
                          )}
                          {film.status !== "rejected" && (
                            <button
                              type="button"
                              disabled={actionLoading === film.id}
                              onClick={() => setRejectModal(film)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filmPagination && filmPagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4 text-sm">
              <button
                type="button"
                onClick={() => setFilmPage((p) => Math.max(1, p - 1))}
                disabled={filmPage === 1}
                className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30"
              >
                &lsaquo;
              </button>
              <span className="font-bold">{filmPage} / {filmPagination.totalPages}</span>
              <button
                type="button"
                onClick={() => setFilmPage((p) => Math.min(filmPagination.totalPages, p + 1))}
                disabled={filmPage === filmPagination.totalPages}
                className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30"
              >
                &rsaquo;
              </button>
            </div>
          )}
        </section>
        )}

        {/* ── Repartition (état + génération) ── */}
        {activeTab === "repartition" && (
        <>
          {/* État actuel */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#262335] mb-4">
              {t("profileSuperJury.currentState")}
            </h2>

            {statsLoading ? (
              <p className="text-[#262335]/60">{t("profileSuperJury.loading")}</p>
            ) : statsError ? (
              <p className="text-red-500">{statsError}</p>
            ) : stats ? (
              <>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-[#262335] text-white px-4 py-2 rounded-lg font-bold">
                    {t("profileSuperJury.films")}: {stats.filmCount}
                  </span>
                  <span className="bg-[#463699] text-white px-4 py-2 rounded-lg font-bold">
                    {t("profileSuperJury.assignments")}: {stats.assignmentCount}
                  </span>
                  <span className="bg-[#463699]/70 text-white px-4 py-2 rounded-lg font-bold">
                    {t("profileSuperJury.juries")}: {stats.juryCount}
                  </span>
                </div>

                {stats.juries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b-2 border-[#262335]/10">
                          <th className="py-3 px-4 font-bold text-[#262335]">
                            {t("profileSuperJury.juryHeader")}
                          </th>
                          <th className="py-3 px-4 font-bold text-[#262335] text-center">
                            {t("profileSuperJury.assignedFilms")}
                          </th>
                          <th className="py-3 px-4 font-bold text-[#262335] text-center">
                            {t("profileSuperJury.ratings")}
                          </th>
                          <th className="py-3 px-4 font-bold text-[#262335] text-center">
                            {t("profileSuperJury.remaining")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.juries.map((jury) => (
                          <tr key={jury.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5 transition-colors">
                            <td className="py-3 px-4 text-[#262335]">{jury.name}</td>
                            <td className="py-3 px-4 text-center font-mono">{jury.assigned_films}</td>
                            <td className="py-3 px-4 text-center font-mono">{jury.rated}</td>
                            <td className="py-3 px-4 text-center font-mono">{jury.remaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-[#262335]/50 italic">{t("profileSuperJury.noData")}</p>
                )}
              </>
            ) : null}
          </section>

          {/* Génération */}
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#262335] mb-4">
              {t("profileSuperJury.generateTitle")}
            </h2>

            <div className="flex flex-wrap gap-4 items-end mb-6">
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-1">
                  {t("profileSuperJury.rLabel")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={R}
                  onChange={(e) => setR(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-1">
                  {t("profileSuperJury.lmaxLabel")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={Lmax}
                  onChange={(e) => setLmax(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-24 px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
                />
              </div>
              <Button onClick={handlePreview} disabled={previewLoading}>
                {previewLoading ? t("profileSuperJury.calculating") : t("profileSuperJury.preview")}
              </Button>
            </div>

            {preview && (
              <div className="bg-[#FBF5F0] rounded-xl p-5 mb-4">
                <h3 className="font-bold text-[#262335] mb-3">
                  {t("profileSuperJury.previewTitle", { R, Lmax })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-[#262335]/60">{t("profileSuperJury.films")}</p>
                    <p className="font-black text-lg">{preview.filmCount}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-[#262335]/60">{t("profileSuperJury.assignments")}</p>
                    <p className="font-black text-lg">{preview.total}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-[#262335]/60">{t("profileSuperJury.minPerJury")}</p>
                    <p className="font-black text-lg">{preview.min}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-[#262335]/60">{t("profileSuperJury.maxPerJury")}</p>
                    <p className="font-black text-lg">{preview.max}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleGenerate} disabled={generating}>
                    {generating ? t("profileSuperJury.generating") : t("profileSuperJury.confirmGenerate")}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="text-[#262335] underline font-bold text-sm"
                  >
                    {t("profileSuperJury.cancel")}
                  </button>
                </div>
              </div>
            )}

            {distResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="font-bold text-green-800 mb-1">{t("profileSuperJury.success")}</p>
                <p className="text-green-700 text-sm">
                  {t("profileSuperJury.resultMessage", {
                    total: distResult.total,
                    juryCount: distResult.juryCount,
                    R: distResult.R,
                    Lmax: distResult.Lmax,
                  })}
                </p>
                <p className="text-green-700 text-sm">
                  {t("profileSuperJury.resultStats", {
                    min: distResult.min,
                    max: distResult.max,
                    avg: distResult.avg,
                  })}
                </p>
              </div>
            )}
          </section>
        </>
        )}
      </div>

      {/* ── Lists tab ── */}
      {activeTab === "lists" && (
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            {openList ? (
              <button
                type="button"
                onClick={() => setOpenList(null)}
                className="flex items-center gap-2 text-[#463699] hover:text-[#262335] font-medium transition-colors"
              >
                ← Retour aux listes
              </button>
            ) : (
              <h2 className="text-xl font-bold text-[#262335]">Listes de répartition</h2>
            )}
          </div>

          {/* Detail view of one list */}
          {openList && (
            <div>
              <h3 className="text-lg font-bold text-[#262335] mb-1">{openList.name}</h3>
              {openList.description && (
                <p className="text-sm text-[#262335]/60 mb-4">{openList.description}</p>
              )}

              <div className="flex gap-3 mb-6">
                <span className="bg-[#262335] text-white px-3 py-1 rounded-full text-sm font-bold">
                  {openList.films?.length || 0} films
                </span>
                <span className="bg-[#463699] text-white px-3 py-1 rounded-full text-sm font-bold">
                  {openList.juries?.length || 0} jurys assignés
                </span>
              </div>

              {/* Juries assigned */}
              {openList.juries?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#262335] uppercase tracking-wide mb-2">Jurys</h4>
                  <div className="flex flex-wrap gap-2">
                    {openList.juries.map((j) => (
                      <span key={j.id} className="bg-[#263335]/5 border border-[#262335]/10 text-[#262335] text-sm px-3 py-1 rounded-full">
                        {j.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Films list */}
              {openList.films?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#262335]/10">
                        <th className="py-3 px-3 font-bold text-[#262335]">Titre</th>
                        <th className="py-3 px-3 font-bold text-[#262335]">Réalisateur</th>
                        <th className="py-3 px-3 font-bold text-[#262335]">Pays</th>
                        <th className="py-3 px-3 font-bold text-[#262335] text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openList.films.map((film) => (
                        <tr key={film.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                          <td className="py-3 px-3 text-[#262335] font-medium">{film.title}</td>
                          <td className="py-3 px-3 text-[#262335]">
                            {film.director_firstname} {film.director_lastname}
                          </td>
                          <td className="py-3 px-3 text-[#262335]">{film.country}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[film.status] || ""}`}>
                              {film.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[#262335]/50 italic">Aucun film dans cette liste.</p>
              )}
            </div>
          )}

          {/* List of all lists */}
          {!openList && (
            <>
              {listsLoading && <p className="text-[#262335]/50">Chargement...</p>}
              {listsError && <p className="text-red-500">{listsError}</p>}
              {!listsLoading && !listsError && lists.length === 0 && (
                <p className="text-[#262335]/50 italic">Aucune liste créée. Générez une répartition pour en créer une automatiquement.</p>
              )}
              {!listsLoading && lists.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      type="button"
                      onClick={() => fetchListById(list.id)}
                      disabled={openListLoading}
                      className="bg-[#FBF5F0] rounded-xl p-5 border border-[#262335]/5 hover:border-[#463699]/40 hover:shadow-md transition-all text-left group disabled:opacity-50"
                    >
                      <h3 className="text-base font-bold text-[#262335] group-hover:text-[#463699] transition-colors mb-1">
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-xs text-[#262335]/60 mb-3 line-clamp-2">{list.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#262335] text-white text-xs font-bold px-3 py-1 rounded-full">
                          {list.film_count} films
                        </span>
                        <span className="bg-[#463699] text-white text-xs font-bold px-3 py-1 rounded-full">
                          {list.jury_count} jurys
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ── Rejection modal ── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#262335] mb-2">
              Refuser : {rejectModal.title}
            </h3>
            <p className="text-sm text-[#262335]/60 mb-4">
              Un email sera envoye au realisateur avec le motif.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du refus (obligatoire)..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                disabled={!rejectReason.trim() || actionLoading === rejectModal.id}
                onClick={() => handleStatusChange(rejectModal.id, "rejected", rejectReason.trim())}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === rejectModal.id ? "..." : "Confirmer le refus"}
              </button>
              <button
                type="button"
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="text-[#262335] underline font-bold text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
