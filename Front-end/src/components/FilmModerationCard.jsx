import { useState } from "react";

/**
 * FilmModerationCard Component
 * Display film information with approve/reject actions
 */
const FilmModerationCard = ({ film, onApprove, onReject, isProcessing }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
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
        {/* Poster Image */}
        <div className="md:col-span-1">
          <div className="relative h-full min-h-[300px] bg-lavender/20">
            {film.poster_url ? (
              <img
                src={film.poster_url}
                alt={film.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-lavender"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
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

        {/* Film Information */}
        <div className="md:col-span-2 p-6">
          {/* Title & Country */}
          <div className="mb-4">
            <h3 className="text-2xl font-black text-dark-purple mb-2 font-saira">
              {film.title}
            </h3>
            {film.country && (
              <p className="text-purple font-semibold flex items-center gap-2">
                <span>🌍</span>
                {film.country}
              </p>
            )}
          </div>

          {/* Director Information */}
          <div className="mb-4 p-4 bg-beige/50 rounded-lg border border-lavender/30">
            <p className="text-sm font-semibold text-purple mb-2">Réalisateur</p>
            <p className="text-dark-purple font-bold">
              {film.director_firstname} {film.director_lastname}
            </p>
            <p className="text-sm text-gray-600">{film.director_email}</p>
            {film.director_school && (
              <p className="text-sm text-purple mt-1">
                🎓 {film.director_school}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-purple mb-2">Description</p>
            <p className="text-gray-700 leading-relaxed">
              {showFullDescription
                ? film.description
                : truncateText(film.description)}
            </p>
            {film.description && film.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-purple hover:text-dark-purple font-semibold text-sm mt-2 transition-colors"
              >
                {showFullDescription ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </div>

          {/* AI Tools Used */}
          {film.ai_tools_used && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-purple mb-2">
                🤖 Outils IA utilisés
              </p>
              <p className="text-gray-700 text-sm">{film.ai_tools_used}</p>
            </div>
          )}

          {/* Submission Date */}
          <div className="mb-6">
            <p className="text-xs text-gray-500">
              Soumis le {formatDate(film.created_at)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-lavender/30">
            <button
              onClick={() => onReject(film)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed font-saira"
            >
              {isProcessing ? "Traitement..." : "❌ Refuser"}
            </button>
            <button
              onClick={() => onApprove(film)}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed font-saira"
            >
              {isProcessing ? "Traitement..." : "✓ Valider"}
            </button>
          </div>

          {/* Film URL */}
          {film.film_url && (
            <div className="mt-4">
              <a
                href={film.film_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple hover:text-dark-purple font-semibold text-sm flex items-center gap-2 transition-colors"
              >
                <span>🎬</span>
                Voir le film
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilmModerationCard;
