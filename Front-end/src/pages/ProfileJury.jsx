import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaPlay, FaTimes, FaUser, FaChartBar } from "react-icons/fa";
import { getToken, logout } from "../services/authService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API_URL = `${API_BASE}/api`;

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Film Card Component (Netflix style)
function FilmCard({ film, onSelect, isSelected }) {
  const videoId = getYouTubeId(film.youtube_url);
  const thumbnailUrl =
    film.thumbnail_url ||
    film.poster_url ||
    (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null);

  const imageUrl = thumbnailUrl?.startsWith("http")
    ? thumbnailUrl
    : thumbnailUrl
      ? `${API_BASE}${thumbnailUrl}`
      : null;

  return (
    <div
      onClick={() => onSelect(film)}
      className={`group relative cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-10 ${
        isSelected ? "ring-4 ring-[#463699] scale-105 z-10" : ""
      }`}
    >
      {/* Thumbnail */}
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-800 shadow-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={film.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = videoId
                ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                : "";
              e.currentTarget.onerror = null;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <FaPlay className="text-gray-500 text-3xl" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FaPlay className="text-black text-sm ml-0.5" />
              </button>
              <span className="text-white text-sm font-medium truncate">
                {film.title}
              </span>
            </div>
          </div>
        </div>

        {/* User rating badge */}
        {film.user_rating !== null && film.user_rating !== undefined && (
          <div className="absolute top-2 right-2 bg-[#463699] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            {film.user_rating}/10
          </div>
        )}

        {/* Average rating badge */}
        {film.average_rating && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <FaChartBar className="text-green-400" />
            {film.average_rating}
          </div>
        )}
      </div>

      {/* Title below */}
      <h3 className="mt-2 text-white text-sm font-medium truncate px-1">
        {film.title}
      </h3>
      <p className="text-gray-400 text-xs truncate px-1">
        {film.director_firstname} {film.director_lastname}
      </p>
    </div>
  );
}

// Rating Modal Component
function RatingModal({ film, onClose, onRate, token }) {
  const [rating, setRating] = useState(film.user_rating ?? 5);
  const [comment, setComment] = useState(film.user_comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const videoId = getYouTubeId(film.youtube_url);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/jury/films/${film.id}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Erreur lors de la notation");
      }

      onRate(film.id, rating, comment);
      onClose();
    } catch (err) {
      console.error("Rating error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#1a1a2e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl z-10"
        >
          <FaTimes />
        </button>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black rounded-t-xl overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={film.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Video non disponible
            </div>
          )}
        </div>

        {/* Film Info & Rating */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Film Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{film.title}</h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#463699] flex items-center justify-center text-white">
                  <FaUser />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {film.director_firstname} {film.director_lastname}
                  </p>
                  {film.director_school && (
                    <p className="text-gray-400 text-sm">{film.director_school}</p>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-4">
                {film.description}
              </p>

              {film.ai_tools_used && (
                <div className="bg-[#262335] p-3 rounded-lg mb-4">
                  <p className="text-xs text-gray-400 mb-1">Outils IA utilises</p>
                  <p className="text-white text-sm">{film.ai_tools_used}</p>
                </div>
              )}

              {film.average_rating && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <FaChartBar className="text-green-400" />
                  <span>
                    Moyenne:{" "}
                    <span className="text-white font-bold">{film.average_rating}</span>
                    /10 ({film.total_ratings} vote
                    {film.total_ratings > 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            {/* Right: Rating Form */}
            <div className="md:w-80 bg-[#262335] rounded-xl p-5">
              <h3 className="text-white font-bold text-lg mb-4">Votre note</h3>

              {/* Rating Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Note</span>
                  <span className="text-3xl font-bold text-[#463699]">{rating}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#463699]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              {/* Star visualization */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(10)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-lg cursor-pointer ${
                      i < Math.round(rating)
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                    onClick={() => setRating(i + 1)}
                  />
                ))}
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">
                  Commentaire (optionnel)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Votre avis sur ce film..."
                  className="w-full bg-[#1a1a2e] text-white border border-gray-700 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#463699]"
                  rows={3}
                />
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-[#463699] hover:bg-[#5a47b8] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Envoi en cours..." : "Enregistrer ma note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main ProfileJury Component
export default function ProfileJury() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [filter, setFilter] = useState("all"); // all, rated, unrated
  const token = getToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchFilms = async () => {
      if (!token) {
        setError("Vous devez etre connecte pour acceder a cette page");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/jury/films`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "Erreur lors du chargement");
        }

        setFilms(data.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [token]);

  const handleRate = (filmId, rating, comment) => {
    setFilms((prev) =>
      prev.map((f) =>
        f.id === filmId
          ? { ...f, user_rating: rating, user_comment: comment }
          : f
      )
    );
  };

  const filteredFilms = films.filter((film) => {
    if (filter === "rated") return film.user_rating != null;
    if (filter === "unrated") return film.user_rating == null;
    return true;
  });

  const ratedCount = films.filter((f) => f.user_rating != null).length;
  const totalCount = films.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#463699] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Chargement des films...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Erreur</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Se deconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
              Espace Jury
            </h1>
            <p className="text-gray-400">
              Evaluez les films soumis au festival avec une note de 0 a 10
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600/20 text-red-400 text-sm font-medium hover:bg-red-600/30 transition"
          >
            Se deconnecter
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-[#1a1a2e] rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{totalCount}</p>
              <p className="text-xs text-gray-400">Films</p>
            </div>
            <div className="h-10 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">{ratedCount}</p>
              <p className="text-xs text-gray-400">Notes</p>
            </div>
            <div className="h-10 w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-400">
                {totalCount - ratedCount}
              </p>
              <p className="text-xs text-gray-400">A noter</p>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "Tous" },
              { key: "unrated", label: "A noter" },
              { key: "rated", label: "Notes" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f.key
                    ? "bg-[#463699] text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Films Grid (Netflix style) */}
        {filteredFilms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredFilms.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                onSelect={setSelectedFilm}
                isSelected={selectedFilm?.id === film.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">
              {filter === "unrated"
                ? "Vous avez note tous les films !"
                : filter === "rated"
                  ? "Vous n'avez pas encore note de films"
                  : "Aucun film disponible pour le moment"}
            </p>
          </div>
        )}

        {/* Rating Modal */}
        {selectedFilm && (
          <RatingModal
            film={selectedFilm}
            onClose={() => setSelectedFilm(null)}
            onRate={handleRate}
            token={token}
          />
        )}
      </div>
    </div>
  );
}
