// src/pages/ProfileSuperJury.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaBolt, FaPlus, FaTimes, FaTrash } from "react-icons/fa";
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
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("generator");

  // ─── Films moderation ──────────────────────────────────────
  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const [filmFilter, setFilmFilter] = useState("pending");
  const [filmPage, setFilmPage] = useState(1);
  const [filmPagination, setFilmPagination] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ─── Lists management ──────────────────────────────────────
  const [lists, setLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListLoading, setSelectedListLoading] = useState(false);
  const [createListModal, setCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [creatingList, setCreatingList] = useState(false);
  const [addFilmsModal, setAddFilmsModal] = useState(false);
  const [approvedFilms, setApprovedFilms] = useState([]);
  const [approvedFilmsLoading, setApprovedFilmsLoading] = useState(false);
  const [selectedFilmIds, setSelectedFilmIds] = useState([]);
  const [addingFilms, setAddingFilms] = useState(false);
  const [assignJuryModal, setAssignJuryModal] = useState(false);
  const [allJuries, setAllJuries] = useState([]);
  const [juriesLoading, setJuriesLoading] = useState(false);
  const [selectedJuryIds, setSelectedJuryIds] = useState([]);
  const [assigningJuries, setAssigningJuries] = useState(false);

  // ─── Generator ─────────────────────────────────────────────
  const [genR, setGenR] = useState(3);
  const [filmsPerList, setFilmsPerList] = useState(20);
  const [namePrefix, setNamePrefix] = useState("List");
  const [strictSameSize, setStrictSameSize] = useState(true);

  // Preview / confirm flow
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);   // summary from server
  const [previewToken, setPreviewToken] = useState(null); // token to confirm
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [genSuccess, setGenSuccess] = useState("");

  const resetGenerator = () => {
    setPreviewData(null);
    setPreviewToken(null);
    setGenError("");
    setGenSuccess("");
  };

  // ─── Fetch profile ─────────────────────────────────────────
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

  // ─── Fetch films ───────────────────────────────────────────
  const fetchFilms = useCallback(
    async (page = 1, status = "pending") => {
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
    },
    [token]
  );

  // ─── Fetch lists ───────────────────────────────────────────
  const fetchLists = useCallback(async () => {
    setListsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setLists(json.data || []);
    } catch (err) {
      console.error("Lists error:", err);
      setLists([]);
    } finally {
      setListsLoading(false);
    }
  }, [token]);

  const fetchListDetail = useCallback(
    async (listId) => {
      setSelectedListLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/admin/lists/${listId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error");
        setSelectedList(json.data);
      } catch (err) {
        console.error("List detail error:", err);
      } finally {
        setSelectedListLoading(false);
      }
    },
    [token]
  );

  useEffect(() => { fetchProfile(); }, [fetchProfile]);
  useEffect(() => {
    if (activeTab === "films") fetchFilms(filmPage, filmFilter);
  }, [activeTab, filmPage, filmFilter, fetchFilms]);
  useEffect(() => {
    if (activeTab === "lists") { fetchLists(); setSelectedList(null); }
  }, [activeTab, fetchLists]);

  // ─── Film moderation ───────────────────────────────────────
  const handleStatusChange = async (filmId, status, reason) => {
    setActionLoading(filmId);
    try {
      const body = { status };
      if (reason) body.rejection_reason = reason;
      const res = await fetch(`${API_URL}/api/admin/films/${filmId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      fetchFilms(filmPage, filmFilter);
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── List CRUD ─────────────────────────────────────────────
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newListName.trim(), description: newListDesc.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setCreateListModal(false);
      setNewListName("");
      setNewListDesc("");
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setCreatingList(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm(t("superJuryLists.confirmDelete"))) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${listId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json?.message || "Error"); }
      setSelectedList(null);
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const openAddFilmsModal = async () => {
    setAddFilmsModal(true);
    setSelectedFilmIds([]);
    setApprovedFilmsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/films?status=approved&limit=5000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      const existingIds = new Set((selectedList?.films || []).map((f) => f.id));
      setApprovedFilms((json.data || []).filter((f) => !existingIds.has(f.id)));
    } catch (err) {
      console.error(err);
      setApprovedFilms([]);
    } finally {
      setApprovedFilmsLoading(false);
    }
  };

  const handleAddFilms = async () => {
    if (selectedFilmIds.length === 0) return;
    setAddingFilms(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${selectedList.id}/films`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filmIds: selectedFilmIds }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json?.message || "Error"); }
      setAddFilmsModal(false);
      fetchListDetail(selectedList.id);
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAddingFilms(false);
    }
  };

  const handleRemoveFilm = async (filmId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${selectedList.id}/films`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filmIds: [filmId] }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json?.message || "Error"); }
      fetchListDetail(selectedList.id);
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const openAssignJuryModal = async () => {
    setAssignJuryModal(true);
    setSelectedJuryIds([]);
    setJuriesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      const existingIds = new Set((selectedList?.juries || []).map((j) => j.id));
      setAllJuries((json.data || []).filter((u) => u.roles?.includes(1) && !existingIds.has(u.id)));
    } catch (err) {
      console.error(err);
      setAllJuries([]);
    } finally {
      setJuriesLoading(false);
    }
  };

  const handleAssignJuries = async () => {
    if (selectedJuryIds.length === 0) return;
    setAssigningJuries(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${selectedList.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ juryIds: selectedJuryIds }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json?.message || "Error"); }
      setAssignJuryModal(false);
      fetchListDetail(selectedList.id);
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAssigningJuries(false);
    }
  };

  const handleRemoveJury = async (juryId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/${selectedList.id}/assign`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ juryIds: [juryId] }),
      });
      if (!res.ok) { const json = await res.json(); throw new Error(json?.message || "Error"); }
      fetchListDetail(selectedList.id);
      fetchLists();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const toggleFilmId = (id) => setSelectedFilmIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleJuryId = (id) => setSelectedJuryIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  // ─── Generator: Step 1 — Preview ───────────────────────────
  const handlePreview = async () => {
    setPreviewLoading(true);
    setGenError("");
    setGenSuccess("");
    setPreviewData(null);
    setPreviewToken(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/rotation/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ R: Math.max(1, parseInt(genR, 10) || 1), filmsPerList: Math.max(1, parseInt(filmsPerList, 10) || 1) }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || "Erreur prévisualisation");
      setPreviewData(json.data);
      setPreviewToken(json.previewToken);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // ─── Generator: Step 2 — Confirm & Generate ────────────────
  const handleConfirmGenerate = async () => {
    if (!previewToken) return;
    setGenLoading(true);
    setGenError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/lists/rotation/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ previewToken, cleanupAuto: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || "Erreur génération");
      setGenSuccess(`✅ ${json.data.totalLists} listes créées avec succès.`);
      setPreviewData(null);
      setPreviewToken(null);
      fetchLists();
      setActiveTab("lists");
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const generatorSummary = useMemo(() => ({
    R: Math.max(1, parseInt(genR, 10) || 1),
    L: Math.max(1, parseInt(filmsPerList, 10) || 1),
  }), [genR, filmsPerList]);

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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#262335]">
            {t("profileSuperJury.title", { name: user?.name || t("profileSuperJury.defaultName") })}
          </h1>
          <Button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}>
            {t("profileSuperJury.logout")}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "generator", label: "Generator" },
            { key: "lists", label: t("superJuryLists.tabTitle") },
            { key: "films", label: "Films" },
          ].map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === key ? "bg-[#262335] text-white" : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ═══ TAB: Generator ═══ */}
        {activeTab === "generator" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
              <h2 className="text-xl font-bold text-[#262335] flex items-center gap-2">
                <FaBolt /> Générateur de listes (rotation circulaire)
              </h2>
              <div className="text-xs text-[#262335]/60">
                DB flow: <span className="font-mono">jury_lists → jury_list_films → jury_list_assignments → jury_assignments</span>
              </div>
            </div>

            {/* Params — disabled once preview is shown */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity ${previewData ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="bg-[#FBF5F0] rounded-xl p-4 border border-[#262335]/10">
                <label className="block text-sm font-bold text-[#262335] mb-1">R (jurys par film)</label>
                <input type="number" min={1} max={10} value={genR}
                  onChange={(e) => { resetGenerator(); setGenR(Math.max(1, parseInt(e.target.value, 10) || 1)); }}
                  className="w-full px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
                />
                <p className="text-xs text-[#262335]/60 mt-2">Exemple: <span className="font-mono">3</span> = chaque film est envoyé à 3 jurys</p>
              </div>

              <div className="bg-[#FBF5F0] rounded-xl p-4 border border-[#262335]/10">
                <label className="block text-sm font-bold text-[#262335] mb-1">Films max par liste</label>
                <input type="number" min={1} max={200} value={filmsPerList}
                  onChange={(e) => { resetGenerator(); setFilmsPerList(Math.max(1, parseInt(e.target.value, 10) || 1)); }}
                  className="w-full px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
                />
                <p className="text-xs text-[#262335]/60 mt-2">
                  Maximum <span className="font-mono">{generatorSummary.L}</span> films/liste.
                  Les listes sont équilibrées (taille identique ±1).
                </p>
              </div>

              <div className="bg-[#FBF5F0] rounded-xl p-4 border border-[#262335]/10">
                <label className="block text-sm font-bold text-[#262335] mb-1">Préfixe du nom</label>
                <input type="text" value={namePrefix} onChange={(e) => setNamePrefix(e.target.value)} placeholder="List"
                  className="w-full px-3 py-2 border-2 border-[#262335]/10 rounded-lg font-medium focus:outline-none focus:border-[#463699]"
                />
                <p className="text-xs text-[#262335]/60 mt-2">Exemple: <span className="font-mono">Round 1</span>, <span className="font-mono">Batch</span>, etc.</p>
              </div>
            </div>

            {/* Step 1: Preview button */}
            {!previewData && !genSuccess && (
              <div className="mt-5">
                <Button onClick={handlePreview} disabled={previewLoading}>
                  <span className="flex items-center gap-2">
                    <FaBolt size={12} /> {previewLoading ? "Calcul en cours…" : "Prévisualiser la distribution"}
                  </span>
                </Button>
              </div>
            )}

            {/* Step 2: Preview result + confirm */}
            {previewData && !genSuccess && (
              <div className="mt-6 border-2 border-[#463699]/30 rounded-2xl p-5 bg-[#463699]/5 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#262335] mb-1">Proposition de distribution</h3>
                  <p className="text-sm text-[#262335]/60">Vérifiez les chiffres ci-dessous avant de confirmer la génération.</p>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Films approuvés",    value: previewData.filmCount },
                    { label: "Jurys",              value: previewData.juryCount },
                    { label: "Total assignations", value: previewData.totalAssignments, accent: true },
                    { label: "Total listes",       value: previewData.totalLists,       accent: true },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className={`rounded-xl p-4 flex flex-col gap-1 ${accent ? "bg-[#463699]/10 border border-[#463699]/30" : "bg-white border border-[#262335]/10"}`}>
                      <span className="text-xs text-[#262335]/50 uppercase tracking-wide">{label}</span>
                      <span className={`text-2xl font-bold ${accent ? "text-[#463699]" : "text-[#262335]"}`}>{value}</span>
                    </div>
                  ))}
                </div>
                {previewData.listSizeMin !== undefined && (
                  <div className="bg-[#463699]/5 border border-[#463699]/20 rounded-xl px-4 py-3 text-sm text-[#262335]">
                    📐 <span className="font-bold">Équilibrage des listes :</span> chaque liste contient{" "}
                    {previewData.listSizeMin === previewData.listSizeMax
                      ? <><span className="font-mono font-bold">{previewData.listSizeMin}</span> films</>
                      : <><span className="font-mono font-bold">{previewData.listSizeMin}</span> ou <span className="font-mono font-bold">{previewData.listSizeMax}</span> films</>
                    }
                    {" "}(max configuré : <span className="font-mono">{previewData.filmsPerList}</span>).
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Min films / jury", value: previewData.minAssignedPerJury },
                    { label: "Max films / jury", value: previewData.maxAssignedPerJury },
                    { label: "Moy films / jury", value: previewData.avgAssignedPerJury },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border border-[#262335]/10 rounded-xl p-3 flex flex-col gap-1">
                      <span className="text-xs text-[#262335]/50 uppercase tracking-wide">{label}</span>
                      <span className="text-xl font-bold text-[#262335]">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Per-jury breakdown */}
                {previewData.juryBreakdown && (
                  <div>
                    <p className="text-sm font-bold text-[#262335] mb-2">Détail par jury</p>
                    <div className="max-h-52 overflow-y-auto rounded-xl border border-[#262335]/10 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-[#FBF5F0] sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-2 font-bold text-[#262335]">Jury</th>
                            <th className="text-right px-4 py-2 font-bold text-[#262335]">Films</th>
                            <th className="text-right px-4 py-2 font-bold text-[#262335]">Listes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.juryBreakdown.map((j) => (
                            <tr key={j.id} className="border-t border-[#262335]/5 hover:bg-[#463699]/5">
                              <td className="px-4 py-2 text-[#262335]">{j.name}</td>
                              <td className="px-4 py-2 text-right font-mono text-[#262335]">{j.filmCount}</td>
                              <td className="px-4 py-2 text-right font-mono text-[#262335]">{j.listCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-1 flex-wrap">
                  <Button onClick={handleConfirmGenerate} disabled={genLoading}>
                    <span className="flex items-center gap-2">
                      <FaBolt size={12} /> {genLoading ? "Génération…" : "✓ Approuver et générer"}
                    </span>
                  </Button>
                  <button type="button" onClick={resetGenerator}
                    className="px-5 py-2 bg-white border-2 border-[#262335]/20 text-[#262335] font-bold text-sm rounded-xl hover:bg-[#262335]/5 transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {genError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-bold text-red-700">Erreur</p>
                <p className="text-red-700 text-sm">{genError}</p>
              </div>
            )}

            {genSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-green-800">Terminé</p>
                  <p className="text-green-700 text-sm">{genSuccess}</p>
                </div>
                <button type="button" onClick={resetGenerator} className="text-sm text-[#463699] font-bold underline">
                  Nouvelle génération
                </button>
              </div>
            )}
          </section>
        )}

        {/* ═══ TAB: Films ═══ */}
        {activeTab === "films" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#262335] mb-4">Gestion des films</h2>
            <div className="flex gap-2 mb-4">
              {["pending", "approved", "rejected"].map((s) => (
                <button key={s} type="button" onClick={() => { setFilmFilter(s); setFilmPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filmFilter === s ? "bg-[#262335] text-white" : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"}`}>
                  {s === "pending" ? "En attente" : s === "approved" ? "Approuvés" : "Refusés"}
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
                      <th className="py-3 px-3 font-bold text-[#262335]">Réalisateur</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Pays</th>
                      <th className="py-3 px-3 font-bold text-[#262335] text-center">Statut</th>
                      <th className="py-3 px-3 font-bold text-[#262335] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {films.map((film) => (
                      <tr key={film.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                        <td className="py-3 px-3 text-[#262335] font-medium">{film.title}</td>
                        <td className="py-3 px-3 text-[#262335]">{film.director_firstname} {film.director_lastname}</td>
                        <td className="py-3 px-3 text-[#262335]">{film.country}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[film.status] || ""}`}>{film.status}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {film.status !== "approved" && (
                              <button type="button" disabled={actionLoading === film.id} onClick={() => handleStatusChange(film.id, "approved")}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50">
                                Approuver
                              </button>
                            )}
                            {film.status !== "rejected" && (
                              <button type="button" disabled={actionLoading === film.id} onClick={() => setRejectModal(film)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50">
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

            {filmPagination && filmPagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4 text-sm">
                <button type="button" onClick={() => setFilmPage((p) => Math.max(1, p - 1))} disabled={filmPage === 1}
                  className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30">&lsaquo;</button>
                <span className="font-bold">{filmPage} / {filmPagination.totalPages}</span>
                <button type="button" onClick={() => setFilmPage((p) => Math.min(filmPagination.totalPages, p + 1))} disabled={filmPage === filmPagination.totalPages}
                  className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30">&rsaquo;</button>
              </div>
            )}
          </section>
        )}

        {/* ═══ TAB: Lists ═══ */}
        {activeTab === "lists" && !selectedList && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#262335]">{t("superJuryLists.title")}</h2>
              <Button onClick={() => setCreateListModal(true)}>
                <span className="flex items-center gap-2"><FaPlus size={12} /> {t("superJuryLists.createList")}</span>
              </Button>
            </div>

            {listsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-[#FBF5F0] rounded-2xl p-5 animate-pulse">
                    <div className="h-5 bg-[#C7C2CE] rounded w-1/3 mb-3" />
                    <div className="h-4 bg-[#C7C2CE] rounded w-2/3 mb-4" />
                  </div>
                ))}
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[#262335]/50 italic">{t("superJuryLists.noLists")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lists.map((list) => (
                  <button key={list.id} type="button" onClick={() => fetchListDetail(list.id)}
                    className="bg-[#FBF5F0] rounded-2xl p-5 hover:shadow-md transition-all text-left group border border-transparent hover:border-[#463699]/30">
                    <h3 className="text-lg font-bold text-[#262335] group-hover:text-[#463699] transition-colors mb-1">{list.name}</h3>
                    {list.description && <p className="text-sm text-[#262335]/60 mb-3 line-clamp-2">{list.description}</p>}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#262335] text-white text-xs font-bold px-3 py-1 rounded-full">{list.film_count} films</span>
                      <span className="bg-[#463699] text-white text-xs font-bold px-3 py-1 rounded-full">{list.jury_count} {t("superJuryLists.juriesLabel")}</span>
                    </div>
                    {list.creator_name && <p className="text-xs text-[#262335]/40 mt-3">{t("superJuryLists.createdBy")} {list.creator_name}</p>}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "lists" && selectedList && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            {selectedListLoading ? (
              <p className="text-[#262335]/50">{t("common.loading")}</p>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setSelectedList(null)}
                      className="flex items-center gap-2 text-[#463699] hover:text-[#262335] font-medium transition-colors">
                      <FaArrowLeft /> {t("superJuryLists.backToLists")}
                    </button>
                    <h2 className="text-xl font-bold text-[#262335]">{selectedList.name}</h2>
                  </div>
                  <button type="button" onClick={() => handleDeleteList(selectedList.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors">
                    <FaTrash size={12} /> {t("superJuryLists.deleteList")}
                  </button>
                </div>

                {selectedList.description && <p className="text-[#262335]/60 mb-6">{selectedList.description}</p>}

                {/* Films */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#262335]">Films ({selectedList.films?.length || 0})</h3>
                    <Button onClick={openAddFilmsModal}>
                      <span className="flex items-center gap-2"><FaPlus size={12} /> {t("superJuryLists.addFilms")}</span>
                    </Button>
                  </div>
                  {selectedList.films?.length === 0 ? (
                    <p className="text-[#262335]/50 italic">{t("superJuryLists.noFilmsInList")}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b-2 border-[#262335]/10">
                            <th className="py-3 px-3 font-bold text-[#262335]">{t("superJuryLists.filmTitle")}</th>
                            <th className="py-3 px-3 font-bold text-[#262335]">{t("superJuryLists.director")}</th>
                            <th className="py-3 px-3 font-bold text-[#262335]">{t("superJuryLists.country")}</th>
                            <th className="py-3 px-3 font-bold text-[#262335] text-center">{t("superJuryLists.actions")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedList.films.map((film) => (
                            <tr key={film.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                              <td className="py-3 px-3 text-[#262335] font-medium">{film.title}</td>
                              <td className="py-3 px-3 text-[#262335]">{film.director_firstname} {film.director_lastname}</td>
                              <td className="py-3 px-3 text-[#262335]">{film.country}</td>
                              <td className="py-3 px-3 text-center">
                                <button type="button" onClick={() => handleRemoveFilm(film.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                  <FaTimes />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Juries */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-[#262335]">{t("superJuryLists.assignedJuries")} ({selectedList.juries?.length || 0})</h3>
                    <Button onClick={openAssignJuryModal}>
                      <span className="flex items-center gap-2"><FaPlus size={12} /> {t("superJuryLists.assignJury")}</span>
                    </Button>
                  </div>
                  {selectedList.juries?.length === 0 ? (
                    <p className="text-[#262335]/50 italic">{t("superJuryLists.noJuriesAssigned")}</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {selectedList.juries.map((jury) => (
                        <div key={jury.id} className="flex items-center gap-2 bg-[#463699]/10 rounded-full px-4 py-2">
                          <span className="text-sm font-medium text-[#262335]">{jury.name}</span>
                          <button type="button" onClick={() => handleRemoveJury(jury.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#262335] mb-2">Refuser : {rejectModal.title}</h3>
            <p className="text-sm text-[#262335]/60 mb-4">Un email sera envoyé au réalisateur avec le motif.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motif du refus (obligatoire)…" rows={4}
              className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-sm" />
            <div className="flex gap-3 mt-4">
              <button type="button" disabled={!rejectReason.trim() || actionLoading === rejectModal.id}
                onClick={() => handleStatusChange(rejectModal.id, "rejected", rejectReason.trim())}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50">
                {actionLoading === rejectModal.id ? "…" : "Confirmer le refus"}
              </button>
              <button type="button" onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="text-[#262335] underline font-bold text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {createListModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#262335] mb-4">{t("superJuryLists.createList")}</h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#262335] mb-1">{t("superJuryLists.listName")}</label>
              <input type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)}
                placeholder={t("superJuryLists.listNamePlaceholder")}
                className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-sm" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#262335] mb-1">{t("superJuryLists.listDescription")}</label>
              <textarea value={newListDesc} onChange={(e) => setNewListDesc(e.target.value)}
                placeholder={t("superJuryLists.listDescPlaceholder")} rows={3}
                className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreateList} disabled={creatingList || !newListName.trim()}>
                {creatingList ? t("common.loading") : t("superJuryLists.create")}
              </Button>
              <button type="button" onClick={() => { setCreateListModal(false); setNewListName(""); setNewListDesc(""); }}
                className="text-[#262335] underline font-bold text-sm">{t("common.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {addFilmsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-[#262335] mb-4">{t("superJuryLists.addFilms")}</h3>
            {approvedFilmsLoading ? (
              <p className="text-[#262335]/50">{t("common.loading")}</p>
            ) : approvedFilms.length === 0 ? (
              <p className="text-[#262335]/50 italic">{t("superJuryLists.noAvailableFilms")}</p>
            ) : (
              <>
                <p className="text-sm text-[#262335]/60 mb-3">{t("superJuryLists.selectedCount", { count: selectedFilmIds.length })}</p>
                <div className="overflow-y-auto flex-1 border border-[#262335]/10 rounded-xl">
                  {approvedFilms.map((film) => (
                    <label key={film.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#463699]/5 cursor-pointer border-b border-[#262335]/5 last:border-b-0">
                      <input type="checkbox" checked={selectedFilmIds.includes(film.id)} onChange={() => toggleFilmId(film.id)} className="w-4 h-4 accent-[#463699]" />
                      <span className="flex-1">
                        <span className="font-medium text-[#262335]">{film.title}</span>
                        <span className="text-sm text-[#262335]/60 ml-2">- {film.director_firstname} {film.director_lastname}</span>
                      </span>
                      {film.country && <span className="text-xs text-[#262335]/40">{film.country}</span>}
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddFilms} disabled={addingFilms || selectedFilmIds.length === 0}>
                {addingFilms ? t("common.loading") : t("superJuryLists.addSelected")}
              </Button>
              <button type="button" onClick={() => setAddFilmsModal(false)} className="text-[#262335] underline font-bold text-sm">{t("common.cancel")}</button>
            </div>
          </div>
        </div>
      )}

      {assignJuryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <h3 className="text-lg font-bold text-[#262335] mb-4">{t("superJuryLists.assignJury")}</h3>
            {juriesLoading ? (
              <p className="text-[#262335]/50">{t("common.loading")}</p>
            ) : allJuries.length === 0 ? (
              <p className="text-[#262335]/50 italic">{t("superJuryLists.noAvailableJuries")}</p>
            ) : (
              <>
                <p className="text-sm text-[#262335]/60 mb-3">{t("superJuryLists.selectedJuryCount", { count: selectedJuryIds.length })}</p>
                <div className="overflow-y-auto flex-1 border border-[#262335]/10 rounded-xl">
                  {allJuries.map((jury) => (
                    <label key={jury.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#463699]/5 cursor-pointer border-b border-[#262335]/5 last:border-b-0">
                      <input type="checkbox" checked={selectedJuryIds.includes(jury.id)} onChange={() => toggleJuryId(jury.id)} className="w-4 h-4 accent-[#463699]" />
                      <span className="font-medium text-[#262335]">{jury.name}</span>
                      <span className="text-sm text-[#262335]/40">{jury.email}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAssignJuries} disabled={assigningJuries || selectedJuryIds.length === 0}>
                {assigningJuries ? t("common.loading") : t("superJuryLists.assignSelected")}
              </Button>
              <button type="button" onClick={() => setAssignJuryModal(false)} className="text-[#262335] underline font-bold text-sm">{t("common.cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}