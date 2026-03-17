import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import { useLanguage } from "../context/LanguageContext";
import {
  getPendingFilms,
  approveFilm,
  rejectFilm,
} from "../services/moderationService";

function FilmCard({ film, onApprove, onReject, isProcessing, t, lang }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-lavender/30">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Poster */}
        <div className="md:col-span-1">
          <div className="relative h-full min-h-[300px] bg-lavender/20">
            {film.poster_stream_url || film.poster_url ? (
              <img
                src={film.poster_stream_url || film.poster_url}
                alt={film.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-24 h-24 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
            )}
            {film.ai_certification && (
              <div className="absolute top-3 right-3 bg-purple text-white px-3 py-1 rounded-full text-xs font-bold">
                ✨ AI Certified
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-2 p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-dark-purple mb-2 font-saira">{film.title}</h3>
            {film.country && (
              <p className="text-purple font-semibold flex items-center gap-2">
                <span>🌍</span>{film.country}
              </p>
            )}
          </div>

          <div className="mb-4 p-4 bg-beige/50 rounded-lg border border-lavender/30">
            <p className="text-sm font-semibold text-purple mb-2">{t("adminModeration.director")}</p>
            <p className="text-dark-purple font-bold">{film.director_firstname} {film.director_lastname}</p>
            <p className="text-sm text-gray-600">{film.director_email}</p>
            {film.director_school && (
              <p className="text-sm text-purple mt-1">🎓 {film.director_school}</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-purple mb-2">{t("adminModeration.description")}</p>
            <p className="text-gray-700 leading-relaxed">
              {showFullDescription ? film.description : truncateText(film.description)}
            </p>
            {film.description && film.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-purple hover:text-dark-purple font-semibold text-sm mt-2 transition-colors"
              >
                {showFullDescription ? t("adminModeration.seeLess") : t("adminModeration.seeMore")}
              </button>
            )}
          </div>

          {film.ai_tools_used && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-purple mb-2">{t("adminModeration.aiToolsUsed")}</p>
              <p className="text-gray-700 text-sm">{film.ai_tools_used}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs text-gray-500">
              {t("adminModeration.submittedOn", { date: formatDate(film.created_at) })}
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-lavender/30">
            <button
              onClick={() => onReject(film)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed font-saira"
            >
              {isProcessing ? t("adminModeration.processing") : t("adminModeration.reject")}
            </button>
            <button
              onClick={() => onApprove(film)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed font-saira"
            >
              {isProcessing ? t("adminModeration.processing") : t("adminModeration.approve")}
            </button>
          </div>

          {(film.film_stream_url || film.film_url) && (
            <div className="mt-4">
              <a
                href={film.film_stream_url || film.film_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple hover:text-dark-purple font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <span>🎬</span>
                {t("adminModeration.watchFilm")}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const AdminModeration = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingFilmId, setProcessingFilmId] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

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
      setError(err.message || t("adminModeration.loadError"));
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
      setFilms((prev) => prev.filter((f) => f.id !== selectedFilm.id));
      showToast(t("adminModeration.approvedToast", { title: selectedFilm.title }), "success");
      setShowApproveModal(false);
      setSelectedFilm(null);
    } catch (err) {
      showToast(err.message || t("adminModeration.errorValidation"), "error");
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
      setFilms((prev) => prev.filter((f) => f.id !== selectedFilm.id));
      showToast(t("adminModeration.rejectedToast", { title: selectedFilm.title }), "error");
      setShowRejectModal(false);
      setSelectedFilm(null);
      setRejectionReason("");
    } catch (err) {
      showToast(err.message || t("adminModeration.errorRefus"), "error");
      console.error("Error rejecting film:", err);
    } finally {
      setProcessingFilmId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple border-t-transparent mx-auto mb-4"></div>
          <p className="text-dark-purple font-semibold font-saira">{t("adminModeration.loadingText")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-dark-purple mb-4 font-saira">{t("adminModeration.errorTitle")}</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={fetchPendingFilms}
            className="px-6 py-3 bg-purple hover:bg-dark-purple text-white font-bold rounded-xl transition-colors font-saira"
          >
            {t("adminModeration.retryBtn")}
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
              <h1 className="text-4xl font-black mb-2 font-saira">{t("adminModeration.pageTitle")}</h1>
              <p className="text-lavender text-lg">{t("adminModeration.pageSubtitle")}</p>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 bg-purple hover:bg-light-purple text-white font-bold rounded-xl transition-colors font-saira"
            >
              {t("adminModeration.backBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("adminModeration.pendingFilms")}</p>
              <p className="text-3xl font-black text-purple font-saira">{films.length}</p>
            </div>
            <button
              onClick={fetchPendingFilms}
              className="px-4 py-2 text-purple hover:bg-lavender/20 font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t("adminModeration.refreshBtn")}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {films.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-lavender mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-dark-purple mb-4 font-saira">{t("adminModeration.emptyTitle")}</h2>
            <p className="text-gray-600 text-lg mb-6">{t("adminModeration.emptyDesc")}</p>
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-3 bg-purple hover:bg-dark-purple text-white font-bold rounded-xl transition-colors font-saira"
            >
              {t("adminModeration.backToDashboard")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {films.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                lang={lang}
                t={t}
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
        title={t("adminModeration.approveModalTitle")}
        message={t("adminModeration.approveModalMessage", { title: selectedFilm?.title })}
        confirmText={t("adminModeration.approveConfirmText")}
        cancelText={t("adminModeration.cancelText")}
        type="success"
      />

      {/* Reject Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectConfirm}
        title={t("adminModeration.rejectModalTitle")}
        type="danger"
        confirmText={t("adminModeration.rejectConfirmText")}
        cancelText={t("adminModeration.cancelText")}
      >
        <p className="text-gray-700 mb-4">
          {t("adminModeration.rejectModalMessage", { title: selectedFilm?.title })}
        </p>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-purple mb-2">
            {t("adminModeration.rejectReasonLabel")}
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t("adminModeration.rejectReasonPlaceholder")}
            className="w-full px-4 py-3 border-2 border-lavender rounded-lg focus:outline-none focus:border-purple resize-none"
            rows="4"
          />
        </div>
      </ConfirmModal>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
            toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            <span className="text-2xl">{toast.type === "success" ? "✓" : "✕"}</span>
            <p className="font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
