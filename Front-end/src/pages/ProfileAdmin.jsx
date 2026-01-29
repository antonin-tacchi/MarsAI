import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { getCurrentUser, logout } from "../services/authService";
=======
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfileAdmin() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("invitations");

  // Invitation form
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    role: "1"
  });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState({ type: "", text: "" });

  // Invitations list
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Films list
  const [films, setFilms] = useState([]);
  const [loadingFilms, setLoadingFilms] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    fetchInvitations();
    fetchFilms();
  }, [navigate]);

  const getAuthHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  });

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await fetch(`${API_URL}/auth/invitations`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setInvitations(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchFilms = async () => {
    setLoadingFilms(true);
    try {
      const res = await fetch(`${API_URL}/films`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setFilms(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching films:", err);
    } finally {
      setLoadingFilms(false);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_URL}/auth/invite`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: inviteForm.email,
          name: inviteForm.name,
          role: parseInt(inviteForm.role)
        })
      });
      const data = await res.json();

      if (data.success) {
        setInviteMessage({ type: "success", text: `Invitation envoyee a ${inviteForm.email}` });
        setInviteForm({ email: "", name: "", role: "1" });
        fetchInvitations();
      } else {
        setInviteMessage({ type: "error", text: data.message || "Erreur lors de l'envoi" });
      }
    } catch (err) {
      setInviteMessage({ type: "error", text: "Erreur de connexion au serveur" });
=======
  const [activeTab, setActiveTab] = useState("films");
  const [films, setFilms] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: "", role_id: 1 });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [filmsRes, invitesRes] = await Promise.all([
        fetch(`${API_URL}/films/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/auth/invitations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (filmsRes.ok) {
        const filmsData = await filmsRes.json();
        setFilms(filmsData.data || []);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvitations(invitesData.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Erreur lors du chargement des donnees");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteSuccess(null);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(inviteForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'envoi de l'invitation");
      }

      setInviteSuccess(`Invitation envoyee a ${inviteForm.email}`);
      setInviteForm({ email: "", role_id: 1 });
      fetchData();
    } catch (err) {
      setError(err.message);
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
    } finally {
      setInviteLoading(false);
    }
  };

<<<<<<< HEAD
  const handleDeleteInvitation = async (id) => {
    if (!confirm("Annuler cette invitation ?")) return;

    try {
      const res = await fetch(`${API_URL}/auth/invitations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchInvitations();
      }
    } catch (err) {
      console.error("Error deleting invitation:", err);
    }
  };

  const handleFilmAction = async (filmId, action) => {
    try {
      const res = await fetch(`${API_URL}/films/${filmId}/${action}`, {
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        fetchFilms();
      }
    } catch (err) {
      console.error(`Error ${action} film:`, err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleName = (roleId) => {
    switch (roleId) {
      case 1: return "Jury";
      case 2: return "Admin";
      case 3: return "Super Jury";
      default: return "Inconnu";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">En attente</span>;
      case "approved":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Approuve</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">Refuse</span>;
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#262335] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Administration MarsAI</h1>
            <p className="text-white/70 text-sm">Connecte en tant que {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition"
          >
            Deconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("invitations")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "invitations"
                ? "bg-[#463699] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Invitations
          </button>
          <button
            onClick={() => setActiveTab("films")}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === "films"
                ? "bg-[#463699] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
=======
  const handleDeleteInvite = async (id) => {
    if (!confirm("Supprimer cette invitation?")) return;

    try {
      const response = await fetch(`${API_URL}/auth/invitations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleFilmStatus = async (filmId, status, reason = null) => {
    try {
      const response = await fetch(`${API_URL}/films/${filmId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, rejection_reason: reason }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const roleNames = { 1: "Jury", 2: "Admin", 3: "Super Jury" };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBF5F0]">
        <div className="animate-spin h-12 w-12 border-4 border-[#463699] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5F0] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-black text-[#262335] mb-8">Dashboard Admin</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("films")}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === "films"
                ? "bg-[#463699] text-white"
                : "bg-white text-[#262335] hover:bg-gray-100"
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
            }`}
          >
            Films ({films.length})
          </button>
<<<<<<< HEAD
        </div>

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Invite Form */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-[#262335] mb-6">Inviter un membre</h2>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#463699]"
                    placeholder="email@exemple.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#463699]"
                    placeholder="Nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#463699]"
                  >
                    <option value="1">Jury</option>
                    <option value="3">Super Jury</option>
                    <option value="2">Admin</option>
                  </select>
                </div>

                {inviteMessage.text && (
                  <div className={`p-3 rounded-lg ${
                    inviteMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {inviteMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="w-full bg-[#463699] text-white py-3 rounded-lg font-medium hover:bg-[#362a7a] transition disabled:opacity-50"
                >
                  {inviteLoading ? "Envoi en cours..." : "Envoyer l'invitation"}
                </button>
              </form>
            </div>

            {/* Invitations List */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-[#262335] mb-6">
                Invitations en attente ({invitations.length})
              </h2>

              {loadingInvitations ? (
                <p className="text-gray-500">Chargement...</p>
              ) : invitations.length === 0 ? (
                <p className="text-gray-500">Aucune invitation en attente</p>
              ) : (
                <div className="space-y-3">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-[#262335]">{inv.email}</p>
                        <p className="text-sm text-gray-500">
                          {getRoleName(inv.role_id)} - Expire le {new Date(inv.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteInvitation(inv.id)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Annuler"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
=======
          <button
            onClick={() => setActiveTab("invitations")}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeTab === "invitations"
                ? "bg-[#463699] text-white"
                : "bg-white text-[#262335] hover:bg-gray-100"
            }`}
          >
            Invitations ({invitations.length})
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
          </div>
        )}

        {/* Films Tab */}
        {activeTab === "films" && (
<<<<<<< HEAD
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-[#262335]">Films soumis</h2>
            </div>

            {loadingFilms ? (
              <p className="p-6 text-gray-500">Chargement...</p>
            ) : films.length === 0 ? (
              <p className="p-6 text-gray-500">Aucun film soumis</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Titre</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Realisateur</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {films.map((film) => (
                      <tr key={film.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-[#262335]">{film.title}</div>
                          {film.country && <div className="text-sm text-gray-500">{film.country}</div>}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {film.director_firstname} {film.director_lastname}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {film.director_email}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(film.status)}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-sm">
                          {new Date(film.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          {film.status === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFilmAction(film.id, "approve")}
                                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                              >
                                Approuver
                              </button>
                              <button
                                onClick={() => handleFilmAction(film.id, "reject")}
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                              >
                                Refuser
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
=======
          <div className="space-y-4">
            {films.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                Aucun film en attente de validation
              </div>
            ) : (
              films.map((film) => (
                <div key={film.id} className="bg-white p-6 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-[#262335]">{film.title}</h3>
                      <p className="text-gray-600">
                        {film.director_firstname} {film.director_lastname}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{film.description?.slice(0, 150)}...</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFilmStatus(film.id, "approved")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Raison du refus:");
                          if (reason) handleFilmStatus(film.id, "rejected", reason);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <div className="space-y-6">
            {/* Invite Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-bold text-[#262335] mb-4">Envoyer une invitation</h2>
              <form onSubmit={handleInvite} className="flex flex-wrap gap-4">
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="Email"
                  required
                  className="flex-1 min-w-[200px] px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#463699] focus:outline-none"
                />
                <select
                  value={inviteForm.role_id}
                  onChange={(e) => setInviteForm({ ...inviteForm, role_id: Number(e.target.value) })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#463699] focus:outline-none"
                >
                  <option value={1}>Jury</option>
                  <option value={3}>Super Jury</option>
                  <option value={2}>Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="px-6 py-3 bg-[#463699] text-white rounded-xl font-bold hover:bg-[#362880] disabled:opacity-50"
                >
                  {inviteLoading ? "Envoi..." : "Inviter"}
                </button>
              </form>
              {inviteSuccess && (
                <p className="mt-3 text-green-600 font-medium">{inviteSuccess}</p>
              )}
            </div>

            {/* Invitations List */}
            <div className="space-y-3">
              {invitations.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                  Aucune invitation en attente
                </div>
              ) : (
                invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="bg-white p-4 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-[#262335]">{inv.email}</p>
                      <p className="text-sm text-gray-500">
                        Role: {inv.role_name || roleNames[inv.role_id]} |
                        Expire: {new Date(inv.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteInvite(inv.id)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      Supprimer
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
      </div>
    </div>
  );
}
