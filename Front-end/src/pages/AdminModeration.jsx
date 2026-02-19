import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FilmModerationCard from "../components/FilmModerationCard";
import ConfirmModal from "../components/ConfirmModal";
import {
  getPendingFilms,
  approveFilm,
  rejectFilm,
} from "../services/moderationService";

/**
 * AdminModeration Page
 * Interface for admins to approve or reject submitted films
 */
const AdminModeration = () => {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingFilmId, setProcessingFilmId] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Success toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch pending films on mount
  useEffect(() => {
    fetchPendingFilms();
  }, []);

  const fetchPendingFilms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingFilms();
      setFilms(response.data || []);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des films");
      console.error("Error fetching films:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleApproveClick = (film) => {
    setSelectedFilm(film);
    setShowApproveModal(true);
  };

  const handleRejectClick = (film) => {
    setSelectedFilm(film);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedFilm) return;

    try {
      setProcessingFilmId(selectedFilm.id);
      await approveFilm(selectedFilm.id);

      // Remove film from list
      setFilms((prev) => prev.filter((f) => f.id !== selectedFilm.id));
      
      showToast(`✓ "${selectedFilm.title}" a été validé avec succès !`, "success");
      setShowApproveModal(false);
      setSelectedFilm(null);
    } catch (err) {
      showToast(err.message || "Erreur lors de la validation", "error");
      console.error("Error approving film:", err);
    } finally {
      setProcessingFilmId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedFilm) return;

    try {
      setProcessingFilmId(selectedFilm.id);
      await rejectFilm(selectedFilm.id, rejectionReason);

      // Remove film from list
      setFilms((prev) => prev.filter((f) => f.id !== selectedFilm.id));
      
      showToast(`"${selectedFilm.title}" a été refusé`, "error");
      setShowRejectModal(false);
      setSelectedFilm(null);
      setRejectionReason("");
    } catch (err) {
      showToast(err.message || "Erreur lors du refus", "error");
      console.error("Error rejecting film:", err);
    } finally {
      setProcessingFilmId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-dark-purple font-semibold font-saira">
            Chargement des films...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-dark-purple mb-4 font-saira">
            Erreur
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchPendingFilms}
            className="px-6 py-3 bg-purple hover:bg-dark-purple text-white font-bold rounded-xl transition-colors font-saira"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* Header */}
      <div className="bg-dark-purple text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2 font-saira">
                🎬 Modération des Films
              </h1>
              <p className="text-lavender text-lg">
                Validez ou refusez les films soumis au festival
              </p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 bg-purple hover:bg-light-purple text-white font-bold rounded-xl transition-colors font-saira"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-600">Films en attente</p>
                <p className="text-3xl font-black text-purple font-saira">
                  {films.length}
                </p>
              </div>
            </div>
            <button
              onClick={fetchPendingFilms}
              className="px-4 py-2 text-purple hover:bg-lavender/20 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {films.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-lavender mb-6">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-dark-purple mb-4 font-saira">
              Aucun film en attente
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Tous les films ont été modérés ! Revenez plus tard.
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 bg-purple hover:bg-dark-purple text-white font-bold rounded-xl transition-colors font-saira"
            >
              Retour au tableau de bord
            </button>
          </div>
        ) : (
          // Films list
          <div className="space-y-6">
            {films.map((film) => (
              <FilmModerationCard
                key={film.id}
                film={film}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                isProcessing={processingFilmId === film.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveConfirm}
        title="Valider ce film ?"
        message={`Êtes-vous sûr de vouloir valider "${selectedFilm?.title}" ? Le film sera ajouté au catalogue public et le réalisateur sera notifié.`}
        confirmText="Valider"
        cancelText="Annuler"
        type="success"
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        title="Refuser ce film ?"
        type="danger"
        confirmText="Refuser"
        cancelText="Annuler"
      >
        <p className="text-gray-700 mb-4">
          Êtes-vous sûr de vouloir refuser "{selectedFilm?.title}" ? Le réalisateur
          sera notifié.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-purple mb-2">
            Raison du refus (optionnel)
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Expliquez pourquoi le film est refusé..."
            className="w-full px-4 py-3 border-2 border-lavender rounded-lg focus:outline-none focus:border-purple resize-none"
            rows="4"
          />
        </div>
      </ConfirmModal>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span className="text-2xl">
              {toast.type === "success" ? "✓" : "✕"}
            </span>
            <p className="font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;