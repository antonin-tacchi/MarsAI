import { useCallback, useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash, FaCopy, FaCheck } from "react-icons/fa";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ROLE_LABELS = { 1: "Jury", 2: "Admin", 3: "Super Jury" };

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

// ─── Helpers ────────────────────────────────────────────────

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function api(url, token, opts = {}) {
  const res = await fetch(url, { headers: authHeaders(token), ...opts });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Error");
  return json;
}

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => chars[b % chars.length])
    .join("");
}

// ─── Input component ────────────────────────────────────────
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-bold text-[#262335] mb-1">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2 border-2 border-[#262335]/10 rounded-lg focus:outline-none focus:border-[#463699]";

// ─── Main component ─────────────────────────────────────────

export default function ProfileAdmin() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("users");
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Users state ──
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", roles: [1] });
  const [showPassword, setShowPassword] = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  // ── Jury state ──
  const [juryMembers, setJuryMembers] = useState([]);
  const [juryLoading, setJuryLoading] = useState(false);
  const [juryModal, setJuryModal] = useState(false);
  const [juryForm, setJuryForm] = useState({ name: "", email: "", role_title: "", bio: "" });
  const [juryPhoto, setJuryPhoto] = useState(null);
  const [juryPhotoPreview, setJuryPhotoPreview] = useState(null);
  const [jurySaving, setJurySaving] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const juryPhotoRef = useRef(null);

  // ── Partners state ──
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnerModal, setPartnerModal] = useState(null); // null | "create" | partner object
  const [partnerForm, setPartnerForm] = useState({ name: "", url: "", display_order: 0 });
  const [partnerLogo, setPartnerLogo] = useState(null);
  const [partnerLogoPreview, setPartnerLogoPreview] = useState(null);
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [partnerSaving, setPartnerSaving] = useState(false);
  const partnerLogoRef = useRef(null);

  // ── Films state ──
  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(false);
  const [filmFilter, setFilmFilter] = useState("");
  const [filmPage, setFilmPage] = useState(1);
  const [filmPagination, setFilmPagination] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ── CMS Pages state ──
  const [pageData, setPageData] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageSaving, setPageSaving] = useState(false);
  const [pageLang, setPageLang] = useState("fr");
  const [pageForm, setPageForm] = useState({ fr: null, en: null });

  // ── Fetch profile ──
  useEffect(() => {
    (async () => {
      try {
        const json = await api(`${API_URL}/api/auth/profile`, token);
        setUser(json?.data || null);
      } catch (err) {
        console.error(err);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [token]);

  // ── Fetch users ──
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const json = await api(`${API_URL}/api/admin/users`, token);
      setUsers(json.data || []);
    } catch (err) { console.error(err); }
    finally { setUsersLoading(false); }
  }, [token]);

  // ── Fetch jury ──
  const fetchJury = useCallback(async () => {
    setJuryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jury-members`);
      const json = await res.json();
      setJuryMembers(json.data || []);
    } catch (err) { console.error(err); }
    finally { setJuryLoading(false); }
  }, []);

  // ── Fetch partners ──
  const fetchPartners = useCallback(async () => {
    setPartnersLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/partners`);
      const json = await res.json();
      setPartners(json.data || []);
    } catch (err) { console.error(err); }
    finally { setPartnersLoading(false); }
  }, []);

  // ── Fetch films ──
  const fetchFilms = useCallback(async (page = 1, status = "") => {
    setFilmsLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status) params.set("status", status);
      const json = await api(`${API_URL}/api/admin/films?${params}`, token);
      setFilms(json.data || []);
      setFilmPagination(json.pagination || null);
    } catch (err) {
      console.error(err);
      setFilms([]);
    } finally { setFilmsLoading(false); }
  }, [token]);

  // ── Fetch page content (CMS) ──
  const fetchPage = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/pages/home`);
      const json = await res.json();
      if (res.ok && json.success) {
        setPageData(json.data);
        const parseFr = typeof json.data.content_fr === "string" ? JSON.parse(json.data.content_fr) : json.data.content_fr || {};
        const parseEn = typeof json.data.content_en === "string" ? JSON.parse(json.data.content_en) : json.data.content_en || {};
        setPageForm({ fr: parseFr, en: parseEn });
      }
    } catch (err) { console.error(err); }
    finally { setPageLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === "users") fetchUsers(); }, [activeTab, fetchUsers]);
  useEffect(() => { if (activeTab === "jury") fetchJury(); }, [activeTab, fetchJury]);
  useEffect(() => { if (activeTab === "partners") fetchPartners(); }, [activeTab, fetchPartners]);
  useEffect(() => { if (activeTab === "films") fetchFilms(filmPage, filmFilter); }, [activeTab, filmPage, filmFilter, fetchFilms]);
  useEffect(() => { if (activeTab === "pages") fetchPage(); }, [activeTab, fetchPage]);

  // ── User CRUD ──
  const openCreateUser = () => {
    setUserForm({ name: "", email: "", password: "", roles: [1] });
    setUserModal("create");
  };
  const openEditUser = (u) => {
    setUserForm({ name: u.name, email: u.email, password: "", roles: u.roles || [] });
    setUserModal(u);
  };
  const handleSaveUser = async () => {
    setUserSaving(true);
    try {
      if (userModal === "create") {
        await api(`${API_URL}/api/admin/users`, token, { method: "POST", body: JSON.stringify(userForm) });
      } else {
        const body = { ...userForm };
        if (!body.password) delete body.password;
        await api(`${API_URL}/api/admin/users/${userModal.id}`, token, { method: "PUT", body: JSON.stringify(body) });
      }
      setUserModal(null);
      fetchUsers();
    } catch (err) { alert(err.message); }
    finally { setUserSaving(false); }
  };
  const handleDeleteUser = async (userId) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irreversible.")) return;
    try {
      await api(`${API_URL}/api/admin/users/${userId}`, token, { method: "DELETE" });
      fetchUsers();
    } catch (err) { alert(err.message); }
  };
  const toggleRole = (roleId) => {
    setUserForm((prev) => {
      const has = prev.roles.includes(roleId);
      return { ...prev, roles: has ? prev.roles.filter((r) => r !== roleId) : [...prev.roles, roleId] };
    });
  };

  // ── Jury handlers ──
  const openJuryModal = () => {
    const pwd = generatePassword();
    setGeneratedPassword(pwd);
    setJuryForm({ name: "", email: "", role_title: "", bio: "" });
    setJuryPhoto(null);
    setJuryPhotoPreview(null);
    setPasswordCopied(false);
    setJuryModal(true);
  };

  const handleJuryPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setJuryPhoto(file);
    setJuryPhotoPreview(URL.createObjectURL(file));
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  const handleCreateJury = async () => {
    if (!juryForm.name || !juryForm.email) return alert("Nom et email requis.");
    setJurySaving(true);
    try {
      // 1. Créer le compte utilisateur avec role jury (1)
      const created = await api(`${API_URL}/api/admin/users`, token, {
        method: "POST",
        body: JSON.stringify({
          name: juryForm.name,
          email: juryForm.email,
          password: generatedPassword,
          roles: [1],
        }),
      });

      const newUserId = created?.data?.id;

      // 2. Mettre à jour le profil jury (photo + role_title + bio) si des données sont fournies
      if (newUserId && (juryPhoto || juryForm.role_title || juryForm.bio)) {
        const fd = new FormData();
        if (juryForm.role_title) fd.append("role_title", juryForm.role_title);
        if (juryForm.bio) fd.append("bio", juryForm.bio);
        if (juryPhoto) fd.append("profile_picture", juryPhoto);

        await fetch(`${API_URL}/api/jury-members/${newUserId}/profile`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      setJuryModal(false);
      fetchJury();
    } catch (err) { alert(err.message); }
    finally { setJurySaving(false); }
  };

  // ── Partner handlers ──
  const openCreatePartner = () => {
    setPartnerForm({ name: "", url: "", display_order: 0 });
    setPartnerLogo(null);
    setPartnerLogoPreview(null);
    setPartnerLogoUrl("");
    setPartnerModal("create");
  };

  const openEditPartner = (p) => {
    setPartnerForm({ name: p.name, url: p.url, display_order: p.display_order || 0 });
    setPartnerLogo(null);
    setPartnerLogoPreview(null);
    setPartnerLogoUrl("");
    setPartnerModal(p);
  };

  const handlePartnerLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPartnerLogo(file);
    setPartnerLogoPreview(URL.createObjectURL(file));
    setPartnerLogoUrl("");
  };

  const handleSavePartner = async () => {
    if (!partnerForm.name || !partnerForm.url) return alert("Nom et URL du site requis.");
    if (partnerModal === "create" && !partnerLogo && !partnerLogoUrl) return alert("Logo requis (fichier ou URL).");
    setPartnerSaving(true);
    try {
      const isCreate = partnerModal === "create";
      const endpoint = isCreate
        ? `${API_URL}/api/partners`
        : `${API_URL}/api/partners/${partnerModal.id}`;
      const method = isCreate ? "POST" : "PUT";

      let body;
      let headers = { Authorization: `Bearer ${token}` };

      if (partnerLogo) {
        // Envoi multipart avec fichier
        const fd = new FormData();
        fd.append("name", partnerForm.name);
        fd.append("url", partnerForm.url);
        fd.append("display_order", String(partnerForm.display_order));
        fd.append("logo", partnerLogo);
        body = fd;
      } else {
        // Envoi JSON avec URL
        headers["Content-Type"] = "application/json";
        body = JSON.stringify({ ...partnerForm, logo: partnerLogoUrl });
      }

      const res = await fetch(endpoint, { method, headers, body });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");

      setPartnerModal(null);
      fetchPartners();
    } catch (err) { alert(err.message); }
    finally { setPartnerSaving(false); }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    try {
      await api(`${API_URL}/api/partners/${partnerId}`, token, { method: "DELETE" });
      fetchPartners();
    } catch (err) { alert(err.message); }
  };

  // ── CMS handlers ──
  const handleSavePage = async () => {
    setPageSaving(true);
    try {
      await api(`${API_URL}/api/admin/pages/home`, token, {
        method: "PUT",
        body: JSON.stringify({ content_fr: pageForm.fr, content_en: pageForm.en }),
      });
      await fetchPage();
    } catch (err) { alert(err.message); }
    finally { setPageSaving(false); }
  };

  const updateSection = (section, field, value) => {
    setPageForm((prev) => ({
      ...prev,
      [pageLang]: { ...prev[pageLang], [section]: { ...(prev[pageLang]?.[section] || {}), [field]: value } },
    }));
  };
  const updateDateItem = (index, field, value) => {
    setPageForm((prev) => {
      const items = [...(prev[pageLang]?.dates?.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, [pageLang]: { ...prev[pageLang], dates: { ...prev[pageLang]?.dates, items } } };
    });
  };
  const addDateItem = () => {
    setPageForm((prev) => {
      const items = [...(prev[pageLang]?.dates?.items || []), { label: "", date: "" }];
      return { ...prev, [pageLang]: { ...prev[pageLang], dates: { ...prev[pageLang]?.dates, items } } };
    });
  };
  const removeDateItem = (index) => {
    setPageForm((prev) => {
      const items = (prev[pageLang]?.dates?.items || []).filter((_, i) => i !== index);
      return { ...prev, [pageLang]: { ...prev[pageLang], dates: { ...prev[pageLang]?.dates, items } } };
    });
  };

  // ── Film handlers ──
  const handleFilmStatus = async (filmId, status, reason) => {
    setActionLoading(filmId);
    try {
      const body = { status };
      if (reason) body.rejection_reason = reason;
      await api(`${API_URL}/api/admin/films/${filmId}/status`, token, { method: "PATCH", body: JSON.stringify(body) });
      fetchFilms(filmPage, filmFilter);
      setRejectModal(null);
      setRejectReason("");
    } catch (err) { alert(err.message); }
    finally { setActionLoading(null); }
  };
  const handleDeleteFilm = async (filmId) => {
    if (!confirm("Supprimer ce film ? Cette action est irreversible.")) return;
    try {
      await api(`${API_URL}/api/admin/films/${filmId}`, token, { method: "DELETE" });
      fetchFilms(filmPage, filmFilter);
    } catch (err) { alert(err.message); }
  };

  if (profileLoading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#262335]">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#262335]">
            Admin — {user?.name || "Panneau"}
          </h1>
          <Button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); window.location.href = "/login"; }}>
            Se deconnecter
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "users", label: "Utilisateurs" },
            { key: "jury", label: "Jury" },
            { key: "partners", label: "Partenaires" },
            { key: "films", label: "Films" },
            { key: "pages", label: "Pages" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${
                activeTab === key ? "bg-[#262335] text-white" : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ════════════════ USERS TAB ════════════════ */}
        {activeTab === "users" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#262335]">Utilisateurs</h2>
              <Button onClick={openCreateUser}>+ Créer</Button>
            </div>
            {usersLoading ? <p className="text-[#262335]/50">Chargement...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#262335]/10">
                      <th className="py-3 px-3 font-bold text-[#262335]">ID</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Nom</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Email</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Rôles</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Date</th>
                      <th className="py-3 px-3 font-bold text-[#262335] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                        <td className="py-3 px-3 font-mono text-[#262335]/60">{u.id}</td>
                        <td className="py-3 px-3 text-[#262335] font-medium">{u.name}</td>
                        <td className="py-3 px-3 text-[#262335]">{u.email}</td>
                        <td className="py-3 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {(u.roles || []).map((r) => (
                              <span key={r} className="px-2 py-0.5 bg-[#463699]/10 text-[#463699] rounded text-xs font-bold">
                                {ROLE_LABELS[r] || r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#262335]/60 text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString("fr-FR") : "-"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button type="button" onClick={() => openEditUser(u)} className="px-3 py-1 bg-[#463699] text-white rounded-lg text-xs font-bold hover:bg-[#463699]/80">Modifier</button>
                            <button type="button" onClick={() => handleDeleteUser(u.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ════════════════ JURY TAB ════════════════ */}
        {activeTab === "jury" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#262335]">Membres du jury</h2>
              <Button onClick={openJuryModal}>+ Ajouter un membre</Button>
            </div>
            {juryLoading ? <p className="text-[#262335]/50">Chargement...</p> : juryMembers.length === 0 ? (
              <p className="text-[#262335]/50 italic">Aucun membre du jury.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {juryMembers.map((m) => (
                  <div key={m.id} className="flex gap-4 p-4 border-2 border-[#262335]/5 rounded-xl hover:border-[#463699]/20 transition-colors">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#8B7EC8] flex items-center justify-center">
                      {m.image_url
                        ? <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                        : <span className="text-white text-xl font-black">{m.name.charAt(0)}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#262335] truncate">{m.name}</p>
                      <p className="text-xs text-[#463699] font-semibold truncate">{m.role || "—"}</p>
                      {m.description && <p className="text-xs text-[#262335]/60 mt-1 line-clamp-2">{m.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ════════════════ PARTNERS TAB ════════════════ */}
        {activeTab === "partners" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#262335]">Partenaires</h2>
              <Button onClick={openCreatePartner}>+ Ajouter un partenaire</Button>
            </div>
            {partnersLoading ? <p className="text-[#262335]/50">Chargement...</p> : partners.length === 0 ? (
              <p className="text-[#262335]/50 italic">Aucun partenaire.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#262335]/10">
                      <th className="py-3 px-3 font-bold text-[#262335]">Logo</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Nom</th>
                      <th className="py-3 px-3 font-bold text-[#262335]">Site</th>
                      <th className="py-3 px-3 font-bold text-[#262335] text-center">Ordre</th>
                      <th className="py-3 px-3 font-bold text-[#262335] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p.id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5">
                        <td className="py-3 px-3">
                          <div className="w-20 h-10 bg-[#262335]/5 rounded flex items-center justify-center overflow-hidden">
                            {p.logo
                              ? <img src={p.logo} alt={p.name} className="max-w-full max-h-full object-contain" />
                              : <span className="text-xs text-[#262335]/30">—</span>
                            }
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#262335] font-medium">{p.name}</td>
                        <td className="py-3 px-3">
                          <a href={p.url} target="_blank" rel="noreferrer" className="text-[#463699] underline text-xs truncate max-w-[150px] block">{p.url}</a>
                        </td>
                        <td className="py-3 px-3 text-center text-[#262335]/60">{p.display_order}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <button type="button" onClick={() => openEditPartner(p)} className="px-3 py-1 bg-[#463699] text-white rounded-lg text-xs font-bold hover:bg-[#463699]/80">Modifier</button>
                            <button type="button" onClick={() => handleDeletePartner(p.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ════════════════ FILMS TAB ════════════════ */}
        {activeTab === "films" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#262335] mb-4">Films</h2>
            <div className="flex gap-2 mb-4">
              {[{ val: "", label: "Tous" }, { val: "pending", label: "En attente" }, { val: "approved", label: "Approuvés" }, { val: "rejected", label: "Refusés" }].map(({ val, label }) => (
                <button key={val} type="button" onClick={() => { setFilmFilter(val); setFilmPage(1); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filmFilter === val ? "bg-[#262335] text-white" : "bg-[#262335]/10 text-[#262335] hover:bg-[#262335]/20"}`}>
                  {label}
                </button>
              ))}
            </div>
            {filmsLoading ? <p className="text-[#262335]/50">Chargement...</p> : films.length === 0 ? (
              <p className="text-[#262335]/50 italic">Aucun film.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#262335]/10">
                      <th className="py-3 px-3 font-bold text-[#262335]">ID</th>
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
                        <td className="py-3 px-3 font-mono text-[#262335]/60">{film.id}</td>
                        <td className="py-3 px-3 text-[#262335] font-medium">{film.title}</td>
                        <td className="py-3 px-3 text-[#262335]">{film.director_firstname} {film.director_lastname}</td>
                        <td className="py-3 px-3 text-[#262335]">{film.country}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[film.status] || ""}`}>{film.status}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {film.status !== "approved" && (
                              <button type="button" disabled={actionLoading === film.id} onClick={() => handleFilmStatus(film.id, "approved")}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 disabled:opacity-50">Approuver</button>
                            )}
                            {film.status !== "rejected" && (
                              <button type="button" disabled={actionLoading === film.id} onClick={() => setRejectModal(film)}
                                className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-bold hover:bg-orange-600 disabled:opacity-50">Refuser</button>
                            )}
                            <button type="button" onClick={() => handleDeleteFilm(film.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Supprimer</button>
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
                <button type="button" onClick={() => setFilmPage((p) => Math.max(1, p - 1))} disabled={filmPage === 1} className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30">&lsaquo;</button>
                <span className="font-bold">{filmPage} / {filmPagination.totalPages}</span>
                <button type="button" onClick={() => setFilmPage((p) => Math.min(filmPagination.totalPages, p + 1))} disabled={filmPage === filmPagination.totalPages} className="px-3 py-1 bg-[#262335]/10 rounded disabled:opacity-30">&rsaquo;</button>
              </div>
            )}
          </section>
        )}

        {/* ════════════════ PAGES TAB (CMS) ════════════════ */}
        {activeTab === "pages" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#262335]">Page d&apos;accueil</h2>
              <div className="flex gap-2">
                {["fr", "en"].map((l) => (
                  <button key={l} type="button" onClick={() => setPageLang(l)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${pageLang === l ? "bg-[#463699] text-white" : "bg-[#463699]/10 text-[#463699] hover:bg-[#463699]/20"}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {pageLoading ? <p className="text-[#262335]/50">Chargement...</p> : !pageForm[pageLang] ? (
              <p className="text-[#262335]/50 italic">Aucun contenu.</p>
            ) : (
              <div className="space-y-8">
                <fieldset className="border border-[#262335]/10 rounded-xl p-4">
                  <legend className="px-2 font-bold text-[#262335] text-sm">Hero</legend>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Titre</label><input type="text" value={pageForm[pageLang]?.hero?.title || ""} onChange={(e) => updateSection("hero", "title", e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Sous-titre</label><textarea rows={2} value={pageForm[pageLang]?.hero?.subtitle || ""} onChange={(e) => updateSection("hero", "subtitle", e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Image de fond (URL)</label><input type="text" value={pageForm[pageLang]?.hero?.backgroundImage || ""} onChange={(e) => updateSection("hero", "backgroundImage", e.target.value)} placeholder="https://example.com/image.jpg" className={inputCls} /></div>
                  </div>
                </fieldset>
                <fieldset className="border border-[#262335]/10 rounded-xl p-4">
                  <legend className="px-2 font-bold text-[#262335] text-sm">A propos</legend>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Titre</label><input type="text" value={pageForm[pageLang]?.about?.title || ""} onChange={(e) => updateSection("about", "title", e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Texte</label><textarea rows={4} value={pageForm[pageLang]?.about?.text || ""} onChange={(e) => updateSection("about", "text", e.target.value)} className={inputCls} /></div>
                  </div>
                </fieldset>
                <fieldset className="border border-[#262335]/10 rounded-xl p-4">
                  <legend className="px-2 font-bold text-[#262335] text-sm">Dates clés</legend>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Titre</label><input type="text" value={pageForm[pageLang]?.dates?.title || ""} onChange={(e) => updateSection("dates", "title", e.target.value)} className={inputCls} /></div>
                    {(pageForm[pageLang]?.dates?.items || []).map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input type="text" value={item.label || ""} onChange={(e) => updateDateItem(i, "label", e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 border-2 border-[#262335]/10 rounded-lg focus:outline-none focus:border-[#463699] text-sm" />
                        <input type="text" value={item.date || ""} onChange={(e) => updateDateItem(i, "date", e.target.value)} placeholder="Date" className="flex-1 px-3 py-2 border-2 border-[#262335]/10 rounded-lg focus:outline-none focus:border-[#463699] text-sm" />
                        <button type="button" onClick={() => removeDateItem(i)} className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200">X</button>
                      </div>
                    ))}
                    <button type="button" onClick={addDateItem} className="px-4 py-2 bg-[#262335]/5 text-[#262335] rounded-lg text-sm font-bold hover:bg-[#262335]/10">+ Ajouter une date</button>
                  </div>
                </fieldset>
                <fieldset className="border border-[#262335]/10 rounded-xl p-4">
                  <legend className="px-2 font-bold text-[#262335] text-sm">Appel à l&apos;action</legend>
                  <div className="space-y-3">
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Titre</label><input type="text" value={pageForm[pageLang]?.cta?.title || ""} onChange={(e) => updateSection("cta", "title", e.target.value)} className={inputCls} /></div>
                    <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Texte</label><textarea rows={2} value={pageForm[pageLang]?.cta?.text || ""} onChange={(e) => updateSection("cta", "text", e.target.value)} className={inputCls} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Texte du bouton</label><input type="text" value={pageForm[pageLang]?.cta?.buttonText || ""} onChange={(e) => updateSection("cta", "buttonText", e.target.value)} className={inputCls} /></div>
                      <div><label className="block text-xs font-bold text-[#262335]/60 mb-1">Lien du bouton</label><input type="text" value={pageForm[pageLang]?.cta?.buttonLink || ""} onChange={(e) => updateSection("cta", "buttonLink", e.target.value)} placeholder="/submissions" className={inputCls} /></div>
                    </div>
                  </div>
                </fieldset>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSavePage} disabled={pageSaving}>{pageSaving ? "Enregistrement..." : "Enregistrer les modifications"}</Button>
                  <button type="button" onClick={fetchPage} className="text-[#262335] underline font-bold text-sm">Annuler</button>
                </div>
                {pageData?.updated_at && <p className="text-xs text-[#262335]/40">Dernière modification : {new Date(pageData.updated_at).toLocaleString("fr-FR")}</p>}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ════════════════ JURY CREATE MODAL ════════════════ */}
      {juryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#262335] mb-5">Ajouter un membre du jury</h3>
            <div className="space-y-4">

              {/* Photo de profil */}
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-2">Photo de profil</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full bg-[#8B7EC8] flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-[#463699]/30 hover:border-[#463699] transition-colors"
                    onClick={() => juryPhotoRef.current?.click()}
                  >
                    {juryPhotoPreview
                      ? <img src={juryPhotoPreview} alt="preview" className="w-full h-full object-cover" />
                      : <span className="text-white text-2xl font-black">{juryForm.name ? juryForm.name.charAt(0).toUpperCase() : "+"}</span>
                    }
                  </div>
                  <div>
                    <button type="button" onClick={() => juryPhotoRef.current?.click()} className="px-4 py-2 bg-[#463699]/10 text-[#463699] rounded-lg text-sm font-bold hover:bg-[#463699]/20">
                      {juryPhoto ? "Changer la photo" : "Choisir une photo"}
                    </button>
                    <p className="text-xs text-[#262335]/40 mt-1">JPG, PNG, WebP — max 5 MB</p>
                  </div>
                </div>
                <input ref={juryPhotoRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleJuryPhotoChange} />
              </div>

              <Field label="Nom complet *">
                <input type="text" value={juryForm.name} onChange={(e) => setJuryForm((f) => ({ ...f, name: e.target.value }))} placeholder="Prénom Nom" className={inputCls} />
              </Field>

              <Field label="Email *">
                <input type="email" value={juryForm.email} onChange={(e) => setJuryForm((f) => ({ ...f, email: e.target.value }))} placeholder="membre@jury.com" className={inputCls} />
              </Field>

              <Field label="Profession / Rôle">
                <input type="text" value={juryForm.role_title} onChange={(e) => setJuryForm((f) => ({ ...f, role_title: e.target.value }))} placeholder="Ex : Directeur Artistique / OpenAI" className={inputCls} />
              </Field>

              <Field label="Bio (optionnel)">
                <textarea rows={3} value={juryForm.bio} onChange={(e) => setJuryForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Description courte du membre..." className={inputCls} />
              </Field>

              {/* Mot de passe généré */}
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-2">Mot de passe temporaire généré</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2 bg-[#262335]/5 border-2 border-[#262335]/10 rounded-lg font-mono text-sm text-[#262335] select-all">
                    {generatedPassword}
                  </div>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="px-3 py-2 bg-[#463699] text-white rounded-lg hover:bg-[#463699]/80 transition-colors flex items-center gap-1.5 text-sm font-bold"
                  >
                    {passwordCopied ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    {passwordCopied ? "Copié !" : "Copier"}
                  </button>
                </div>
                <p className="text-xs text-[#262335]/50 mt-1.5">
                  ⚠️ Communiquez ce mot de passe au membre. Il devra le changer à sa première connexion.
                </p>
                {/* Mailto link */}
                <a
                  href={`mailto:${juryForm.email}?subject=Votre accès MarsAI Jury&body=Bonjour ${juryForm.name},%0A%0AVoici vos identifiants de connexion pour la plateforme MarsAI :%0A%0AEmail : ${juryForm.email}%0AMot de passe temporaire : ${generatedPassword}%0A%0AVeuillez changer votre mot de passe dès votre première connexion.%0A%0ACordialement,%0AL'équipe MarsAI`}
                  className={`inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors ${!juryForm.email ? "opacity-40 pointer-events-none" : ""}`}
                >
                  ✉️ Ouvrir un email avec les identifiants
                </a>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleCreateJury} disabled={jurySaving}>
                {jurySaving ? "Création en cours..." : "Créer le membre"}
              </Button>
              <button type="button" onClick={() => setJuryModal(false)} className="text-[#262335] underline font-bold text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ PARTNER CREATE/EDIT MODAL ════════════════ */}
      {partnerModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#262335] mb-5">
              {partnerModal === "create" ? "Ajouter un partenaire" : `Modifier : ${partnerModal.name}`}
            </h3>
            <div className="space-y-4">

              {/* Logo */}
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-2">
                  Logo {partnerModal === "create" ? "*" : "(laisser vide pour conserver l'actuel)"}
                </label>

                {/* Aperçu */}
                {(partnerLogoPreview || (partnerModal !== "create" && partnerModal.logo)) && (
                  <div className="mb-3 w-40 h-20 bg-[#262335]/5 rounded-xl flex items-center justify-center overflow-hidden border border-[#262335]/10">
                    <img src={partnerLogoPreview || partnerModal.logo} alt="logo preview" className="max-w-full max-h-full object-contain p-2" />
                  </div>
                )}

                {/* Upload fichier */}
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => partnerLogoRef.current?.click()} className="px-4 py-2 bg-[#463699]/10 text-[#463699] rounded-lg text-sm font-bold hover:bg-[#463699]/20">
                    📁 {partnerLogo ? partnerLogo.name : "Choisir un fichier"}
                  </button>
                  <input ref={partnerLogoRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handlePartnerLogoChange} />
                </div>

                {/* OU URL externe */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-px bg-[#262335]/10" />
                  <span className="text-xs text-[#262335]/40 font-bold">OU</span>
                  <div className="flex-1 h-px bg-[#262335]/10" />
                </div>
                <input
                  type="url"
                  value={partnerLogoUrl}
                  onChange={(e) => { setPartnerLogoUrl(e.target.value); setPartnerLogo(null); setPartnerLogoPreview(null); }}
                  placeholder="https://example.com/logo.png"
                  className={inputCls}
                  disabled={!!partnerLogo}
                />
                <p className="text-xs text-[#262335]/40 mt-1">JPG, PNG, WebP, SVG — max 5 MB</p>
              </div>

              <Field label="Nom du partenaire *">
                <input type="text" value={partnerForm.name} onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex : La Plateforme" className={inputCls} />
              </Field>

              <Field label="URL du site *">
                <input type="url" value={partnerForm.url} onChange={(e) => setPartnerForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://exemple-partenaire.com" className={inputCls} onBlur={(e) => { if (e.target.value && !/^https?:\/\//.test(e.target.value)) setPartnerForm((f) => ({ ...f, url: "https://" + e.target.value })); }} />
              </Field>

              <Field label="Ordre d'affichage">
                <input type="number" min="0" value={partnerForm.display_order} onChange={(e) => setPartnerForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))} className={inputCls} />
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSavePartner} disabled={partnerSaving}>
                {partnerSaving ? "Enregistrement..." : partnerModal === "create" ? "Créer" : "Enregistrer"}
              </Button>
              <button type="button" onClick={() => setPartnerModal(null)} className="text-[#262335] underline font-bold text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ USER CREATE/EDIT MODAL ════════════════ */}
      {userModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#262335] mb-4">
              {userModal === "create" ? "Créer un utilisateur" : `Modifier : ${userModal.name}`}
            </h3>
            <div className="space-y-4">
              <Field label="Nom">
                <input type="text" value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Email">
                <input type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} className={inputCls} />
              </Field>
              <Field label={`Mot de passe${userModal !== "create" ? " (laisser vide pour ne pas changer)" : ""}`}>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} className={`${inputCls} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262335]/50 hover:text-[#463699]">
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </Field>
              <div>
                <label className="block text-sm font-bold text-[#262335] mb-2">Rôles</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((roleId) => (
                    <label key={roleId} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={userForm.roles.includes(roleId)} onChange={() => toggleRole(roleId)} className="w-4 h-4 accent-[#463699]" />
                      <span className="text-sm font-medium text-[#262335]">{ROLE_LABELS[roleId]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSaveUser} disabled={userSaving}>{userSaving ? "..." : userModal === "create" ? "Créer" : "Enregistrer"}</Button>
              <button type="button" onClick={() => setUserModal(null)} className="text-[#262335] underline font-bold text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ REJECTION MODAL ════════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#262335] mb-2">Refuser : {rejectModal.title}</h3>
            <p className="text-sm text-[#262335]/60 mb-4">Un email sera envoyé au réalisateur avec le motif.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Motif du refus (obligatoire)..." rows={4} className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-sm" />
            <div className="flex gap-3 mt-4">
              <button type="button" disabled={!rejectReason.trim() || actionLoading === rejectModal.id} onClick={() => handleFilmStatus(rejectModal.id, "rejected", rejectReason.trim())}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50">
                {actionLoading === rejectModal.id ? "..." : "Confirmer le refus"}
              </button>
              <button type="button" onClick={() => { setRejectModal(null); setRejectReason(""); }} className="text-[#262335] underline font-bold text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}