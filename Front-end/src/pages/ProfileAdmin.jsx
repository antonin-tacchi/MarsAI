import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfileAdmin() {
  const navigate = useNavigate();
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
    } finally {
      setInviteLoading(false);
    }
  };

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
            }`}
          >
            Films ({films.length})
          </button>
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
          </div>
        )}

        {/* Films Tab */}
        {activeTab === "films" && (
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
      </div>
    </div>
  );
}
