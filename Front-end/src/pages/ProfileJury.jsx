import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import {
  getFilmsForJury,
  getCategories,
  rateFilm,
  updateFilmCategories,
  approveFilm,
  rejectFilm,
} from "../services/filmService";
import { getCurrentUser, logout } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Star Rating Component
function StarRating({ rating, onRate, size = "md", readOnly = false }) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          className={`${sizes[size]} transition-transform ${!readOnly && "hover:scale-110 cursor-pointer"}`}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          onClick={() => !readOnly && onRate(star)}
        >
          <svg
            viewBox="0 0 24 24"
            fill={star <= (hoverRating || rating) ? "#facc15" : "none"}
            stroke={star <= (hoverRating || rating) ? "#facc15" : "#6b7280"}
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

// Film Card Component
function FilmCard({ film, categories, onSelect, onRate, onApprove, onReject }) {
  const [isHovered, setIsHovered] = useState(false);
  const posterUrl = film.poster_url
    ? film.poster_url.startsWith("http")
      ? film.poster_url
      : `${API_URL}${film.poster_url}`
    : null;

  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
        isHovered ? "scale-105 z-10 shadow-2xl shadow-black/50" : "scale-100"
      }`}
=======

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  if (!url) return null;

  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
};

// YouTube Player Component
const YouTubePlayer = ({ url, title }) => {
  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Video non disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
};

// Video Player Component (supports both YouTube and local files)
const VideoPlayer = ({ film }) => {
  const [showVideo, setShowVideo] = useState(false);

  const youtubeId = getYouTubeVideoId(film.film_url);
  const isYouTube = !!youtubeId;
  const isLocalVideo = film.film_url && !isYouTube && film.film_url.startsWith("/uploads");

  if (!film.film_url) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-6">
        <p className="text-gray-500">Aucune video disponible</p>
      </div>
    );
  }

  if (!showVideo) {
    return (
      <div
        className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6 cursor-pointer group"
        onClick={() => setShowVideo(true)}
      >
        <img
          src={film.thumbnail_url ? `http://localhost:5000${film.thumbnail_url}` : film.poster_url ? `http://localhost:5000${film.poster_url}` : "/placeholder.jpg"}
          alt={film.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-all">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {isYouTube && (
          <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            YouTube
          </div>
        )}
      </div>
    );
  }

  if (isYouTube) {
    return (
      <div className="mb-6">
        <YouTubePlayer url={film.film_url} title={film.title} />
      </div>
    );
  }

  if (isLocalVideo) {
    return (
      <div className="aspect-video rounded-xl overflow-hidden mb-6">
        <video
          src={`http://localhost:5000${film.film_url}`}
          controls
          autoPlay
          className="w-full h-full"
        >
          Votre navigateur ne supporte pas la lecture video.
        </video>
      </div>
    );
  }

  return null;
};

// Star Rating Component
const StarRating = ({ rating, onRate, size = "md", readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`${sizes[size]} transition-all ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <span
            className={
              star <= (hovered || rating)
                ? "text-yellow-400"
                : "text-gray-400"
            }
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

// Film Card Component (Netflix style)
const FilmCard = ({ film, onSelect, onRate }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex-shrink-0 w-48 md:w-56 cursor-pointer group"
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(film)}
    >
      {/* Poster */}
<<<<<<< HEAD
      <div className="aspect-[2/3] bg-gray-800">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col justify-end transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        <h3 className="font-bold text-white text-lg mb-1 line-clamp-2">
          {film.title}
        </h3>
        <p className="text-gray-300 text-sm mb-2">
          {film.director_firstname} {film.director_lastname}
        </p>

        {/* Rating display */}
        <div className="flex items-center gap-2 mb-3">
          {film.average_rating ? (
            <>
              <StarRating rating={Math.round(film.average_rating)} readOnly size="sm" />
              <span className="text-yellow-400 text-sm font-semibold">
                {parseFloat(film.average_rating).toFixed(1)}
              </span>
              <span className="text-gray-400 text-xs">
                ({film.rating_count} vote{film.rating_count > 1 ? "s" : ""})
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-sm">Pas encore note</span>
          )}
        </div>

        {/* Your rating */}
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">Votre note:</p>
          <StarRating
            rating={film.my_rating || 0}
            onRate={(rating) => onRate(film.id, rating)}
            size="sm"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onApprove(film.id)}
            className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded transition-colors"
          >
            Approuver
          </button>
          <button
            onClick={() => onReject(film.id)}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded transition-colors"
          >
            Refuser
          </button>
        </div>
      </div>

      {/* My rating badge */}
      {film.my_rating && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-2 py-1 rounded text-sm">
          {film.my_rating}★
        </div>
      )}
    </div>
  );
}

// Film Detail Modal
function FilmDetailModal({ film, categories, allCategories, onClose, onRate, onUpdateCategories, onApprove, onReject }) {
  const [selectedCategories, setSelectedCategories] = useState(
    film.categories?.map((c) => c.id) || []
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const posterUrl = film.poster_url
    ? film.poster_url.startsWith("http")
      ? film.poster_url
      : `${API_URL}${film.poster_url}`
    : null;

  const filmUrl = film.film_url
    ? film.film_url.startsWith("http")
      ? film.film_url
      : `${API_URL}${film.film_url}`
    : null;

  const handleCategoryToggle = async (categoryId) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(newCategories);
    setIsUpdating(true);

    try {
      await onUpdateCategories(film.id, newCategories);
    } catch (error) {
      console.error("Error updating categories:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with poster */}
        <div className="relative h-64 md:h-80">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={film.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
              <span className="text-8xl">🎬</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {film.title}
            </h2>
            <p className="text-gray-300 text-lg">
              par {film.director_firstname} {film.director_lastname}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Rating section */}
          <div className="flex flex-wrap items-center gap-6 mb-6 pb-6 border-b border-gray-700">
            <div>
              <p className="text-gray-400 text-sm mb-2">Note moyenne</p>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={Math.round(film.average_rating || 0)}
                  readOnly
                  size="lg"
                />
                {film.average_rating ? (
                  <span className="text-yellow-400 text-2xl font-bold">
                    {parseFloat(film.average_rating).toFixed(1)}
                  </span>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </div>
              {film.rating_count > 0 && (
                <p className="text-gray-500 text-sm mt-1">
                  {film.rating_count} vote{film.rating_count > 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="h-16 w-px bg-gray-700" />

            <div>
              <p className="text-gray-400 text-sm mb-2">Votre note</p>
              <StarRating
                rating={film.my_rating || 0}
                onRate={(rating) => onRate(film.id, rating)}
                size="lg"
              />
            </div>
          </div>

          {/* Categories section */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3">Categories du film</p>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  disabled={isUpdating}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategories.includes(cat.id)
                      ? "bg-red-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  } ${isUpdating ? "opacity-50" : ""}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Film info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-white font-semibold mb-2">Description</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {film.description || "Aucune description fournie."}
              </p>
            </div>

            <div className="space-y-3">
              {film.country && (
                <div>
                  <span className="text-gray-500 text-sm">Pays:</span>
                  <span className="text-white ml-2">{film.country}</span>
                </div>
              )}
              {film.ai_tools_used && (
                <div>
                  <span className="text-gray-500 text-sm">Outils IA:</span>
                  <span className="text-white ml-2">{film.ai_tools_used}</span>
                </div>
              )}
              {film.director_email && (
                <div>
                  <span className="text-gray-500 text-sm">Email:</span>
                  <span className="text-white ml-2">{film.director_email}</span>
                </div>
              )}
              {film.director_school && (
                <div>
                  <span className="text-gray-500 text-sm">Ecole:</span>
                  <span className="text-white ml-2">{film.director_school}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500 text-sm">Soumis le:</span>
                <span className="text-white ml-2">
                  {new Date(film.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Video player */}
          {filmUrl && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Visionner le film</h3>
              <video
                src={filmUrl}
                controls
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: "400px" }}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => {
                onApprove(film.id);
                onClose();
              }}
              className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
            >
              Approuver le film
            </button>
            <button
              onClick={() => {
                const reason = prompt("Raison du refus (optionnel):");
                onReject(film.id, reason);
                onClose();
              }}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
            >
              Refuser le film
            </button>
          </div>
=======
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:z-10">
        <img
          src={film.poster_url ? `http://localhost:5000${film.poster_url}` : "/placeholder-poster.jpg"}
          alt={film.title}
          className="w-full h-full object-cover"
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
              {film.title}
            </h3>
            <p className="text-gray-300 text-xs mb-2">
              {film.director_firstname} {film.director_lastname}
            </p>

            {/* Quick Rating */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2"
            >
              <StarRating
                rating={film.user_rating || 0}
                onRate={(r) => onRate(film.id, r)}
                size="sm"
              />
            </div>

            {/* Average Rating */}
            {film.avg_rating && (
              <p className="text-yellow-400 text-xs mt-1">
                Moy: {parseFloat(film.avg_rating).toFixed(1)} ({film.rating_count} votes)
              </p>
            )}
          </div>
        </div>

        {/* User Rating Badge */}
        {film.user_rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
            {film.user_rating}★
          </div>
        )}
      </div>
    </div>
  );
};

// Film Modal Component
const FilmModal = ({ film, onClose, onRate, userRating }) => {
  const [rating, setRating] = useState(userRating || 0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    await onRate(film.id, rating, comment);
    setSubmitting(false);
  };

  if (!film) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="sticky top-0 z-10 flex justify-end p-4">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-10">
          {/* Video Player */}
          <VideoPlayer film={film} />

          {/* Title and Director */}
          <h2 className="text-3xl font-black text-white mb-2">{film.title}</h2>
          <p className="text-gray-400 mb-4">
            {film.director_firstname} {film.director_lastname} • {film.country}
          </p>

          {/* Stats */}
          {film.stats && (
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-[#463699] px-4 py-2 rounded-lg">
                <p className="text-white text-sm">Moyenne</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {film.stats.average || "—"}
                </p>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <p className="text-gray-400 text-sm">Votes</p>
                <p className="text-2xl font-bold text-white">{film.stats.count}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 mb-6">{film.description}</p>

          {/* AI Tools */}
          {film.ai_tools_used && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-2">Outils IA utilises</h4>
              <p className="text-gray-400 text-sm">{film.ai_tools_used}</p>
            </div>
          )}

          {/* Rating Section */}
          <div className="bg-[#262335] p-6 rounded-xl">
            <h3 className="text-white font-bold text-lg mb-4">Votre Note</h3>
            <div className="flex items-center gap-4 mb-4">
              <StarRating rating={rating} onRate={setRating} size="lg" />
              <span className="text-3xl font-bold text-white">{rating || "—"}/5</span>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Commentaire optionnel..."
              className="w-full bg-[#1a1a2e] text-white p-4 rounded-lg border border-gray-700 focus:border-[#463699] focus:outline-none resize-none"
              rows={3}
            />

            <button
              onClick={handleSubmit}
              disabled={!rating || submitting}
              className="mt-4 w-full bg-[#463699] text-white py-3 rounded-lg font-bold hover:bg-[#362880] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              )}
              {submitting ? "Enregistrement..." : "Enregistrer ma note"}
            </button>
          </div>

          {/* Other Ratings */}
          {film.ratings && film.ratings.length > 0 && (
            <div className="mt-6">
              <h3 className="text-white font-bold text-lg mb-4">
                Notes du Jury ({film.ratings.length})
              </h3>
              <div className="space-y-3">
                {film.ratings.map((r) => (
                  <div key={r.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{r.user_name}</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={r.rating} readonly size="sm" />
                        <span className="text-yellow-400 font-bold">{r.rating}</span>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-gray-400 text-sm mt-2">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}

// Main ProfileJury Component
export default function ProfileJury() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, rated, unrated

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filmsRes, categoriesRes] = await Promise.all([
        getFilmsForJury(),
        getCategories(),
      ]);
      setFilms(filmsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError(err.message);
=======
};

// Main Profile Jury Component
export default function ProfileJury() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [activeTab, setActiveTab] = useState("films");
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchFilms();
  }, [token, navigate]);

  const fetchFilms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/jury/films`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFilms(data.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleRate = async (filmId, rating) => {
    try {
      await rateFilm(filmId, rating);
      // Update local state
      setFilms((prev) =>
        prev.map((f) =>
          f.id === filmId
            ? {
                ...f,
                my_rating: rating,
                average_rating:
                  f.rating_count > 0
                    ? (
                        (parseFloat(f.average_rating) * f.rating_count +
                          rating -
                          (f.my_rating || 0)) /
                        (f.my_rating ? f.rating_count : f.rating_count + 1)
                      ).toFixed(1)
                    : rating,
                rating_count: f.my_rating ? f.rating_count : f.rating_count + 1,
              }
            : f
        )
      );

      // Update selected film if open
      if (selectedFilm?.id === filmId) {
        setSelectedFilm((prev) => ({
          ...prev,
          my_rating: rating,
        }));
      }
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleUpdateCategories = async (filmId, categoryIds) => {
    try {
      await updateFilmCategories(filmId, categoryIds);
      // Update local state
      const updatedCategories = categories.filter((c) =>
        categoryIds.includes(c.id)
      );
      setFilms((prev) =>
        prev.map((f) =>
          f.id === filmId ? { ...f, categories: updatedCategories } : f
        )
      );
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleApprove = async (filmId) => {
    try {
      await approveFilm(filmId);
      setFilms((prev) => prev.filter((f) => f.id !== filmId));
      alert("Film approuve avec succes!");
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleReject = async (filmId, reason = "") => {
    try {
      await rejectFilm(filmId, reason);
      setFilms((prev) => prev.filter((f) => f.id !== filmId));
      alert("Film refuse.");
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter films
  const filteredFilms = films.filter((film) => {
    if (filter === "rated") return film.my_rating;
    if (filter === "unrated") return !film.my_rating;
    return true;
  });

  // Stats
  const stats = {
    total: films.length,
    rated: films.filter((f) => f.my_rating).length,
    unrated: films.filter((f) => !f.my_rating).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des films...</p>
        </div>
=======
  const fetchRankings = async () => {
    try {
      const response = await fetch(`${API_URL}/jury/rankings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRankings(data.data || []);
      }
    } catch (err) {
      console.error("Fetch rankings error:", err);
    }
  };

  const fetchFilmDetails = async (filmId) => {
    try {
      const response = await fetch(`${API_URL}/jury/films/${filmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedFilm(data.data);
      }
    } catch (err) {
      console.error("Fetch film error:", err);
    }
  };

  const handleRate = async (filmId, rating, comment = null) => {
    try {
      const response = await fetch(`${API_URL}/jury/films/${filmId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      if (response.ok) {
        // Update films list
        setFilms((prev) =>
          prev.map((f) =>
            f.id === filmId ? { ...f, user_rating: rating } : f
          )
        );

        // Refresh selected film if open
        if (selectedFilm?.id === filmId) {
          fetchFilmDetails(filmId);
        }
      }
    } catch (err) {
      console.error("Rate error:", err);
    }
  };

  const handleSelectFilm = (film) => {
    fetchFilmDetails(film.id);
  };

  // Filter films
  const ratedFilms = films.filter((f) => f.user_rating);
  const unratedFilms = films.filter((f) => !f.user_rating);

  // Check if user is Super Jury (role 3) or Admin (role 2)
  const isSuperJury = user?.roles?.includes(3) || user?.roles?.includes(2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="animate-spin h-12 w-12 border-4 border-[#463699] border-t-transparent rounded-full"></div>
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-red-600">MarsAI</h1>
            <span className="text-gray-400">|</span>
            <span className="text-white font-medium">Espace Jury</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              Bienvenue, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Films en attente
            </h2>
            <p className="text-gray-400">
              {stats.total} film{stats.total !== 1 ? "s" : ""} a evaluer
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Filter buttons */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Tous ({stats.total})
              </button>
              <button
                onClick={() => setFilter("unrated")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "unrated"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                A noter ({stats.unrated})
              </button>
              <button
                onClick={() => setFilter("rated")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === "rated"
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Notes ({stats.rated})
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Films grid */}
        {filteredFilms.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🎬</span>
            <h3 className="text-xl text-white mb-2">Aucun film</h3>
            <p className="text-gray-400">
              {filter === "all"
                ? "Il n'y a pas de films en attente d'evaluation."
                : filter === "unrated"
                ? "Vous avez note tous les films!"
                : "Vous n'avez pas encore note de films."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredFilms.map((film) => (
              <FilmCard
                key={film.id}
                film={film}
                categories={categories}
                onSelect={setSelectedFilm}
                onRate={handleRate}
                onApprove={handleApprove}
                onReject={(id) => {
                  const reason = prompt("Raison du refus (optionnel):");
                  handleReject(id, reason);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Film detail modal */}
      {selectedFilm && (
        <FilmDetailModal
          film={selectedFilm}
          categories={selectedFilm.categories || []}
          allCategories={categories}
          onClose={() => setSelectedFilm(null)}
          onRate={handleRate}
          onUpdateCategories={handleUpdateCategories}
          onApprove={handleApprove}
          onReject={handleReject}
=======
    <div className="min-h-screen bg-[#141414] text-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#463699]/30 to-transparent py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-2">
            Espace {isSuperJury ? "Super Jury" : "Jury"}
          </h1>
          <p className="text-gray-400">
            {films.length} films a evaluer • {ratedFilms.length} notes donnees
          </p>
        </div>
      </div>

      {/* Tabs for Super Jury */}
      {isSuperJury && (
        <div className="px-6 mb-6">
          <div className="max-w-7xl mx-auto flex gap-4">
            <button
              onClick={() => setActiveTab("films")}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === "films"
                  ? "bg-[#463699] text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Films
            </button>
            <button
              onClick={() => {
                setActiveTab("rankings");
                fetchRankings();
              }}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                activeTab === "rankings"
                  ? "bg-[#463699] text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              Classement
            </button>
          </div>
        </div>
      )}

      {/* Films Tab */}
      {activeTab === "films" && (
        <div className="px-6">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Unrated Films */}
            {unratedFilms.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-500 rounded"></span>
                  A Noter ({unratedFilms.length})
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {unratedFilms.map((film) => (
                    <FilmCard
                      key={film.id}
                      film={film}
                      onSelect={handleSelectFilm}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Rated Films */}
            {ratedFilms.length > 0 && (
              <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-500 rounded"></span>
                  Deja Notes ({ratedFilms.length})
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {ratedFilms.map((film) => (
                    <FilmCard
                      key={film.id}
                      film={film}
                      onSelect={handleSelectFilm}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {films.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-xl">
                  Aucun film disponible pour evaluation
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rankings Tab (Super Jury only) */}
      {activeTab === "rankings" && isSuperJury && (
        <div className="px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-6">
              Classement des Films (minimum 3 votes)
            </h2>

            {rankings.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Pas assez de votes pour etablir un classement
              </div>
            ) : (
              <div className="space-y-3">
                {rankings.map((film) => (
                  <div
                    key={film.id}
                    className={`flex items-center gap-4 p-4 rounded-xl ${
                      film.rank <= 3 ? "bg-[#463699]/30" : "bg-gray-800"
                    }`}
                  >
                    {/* Rank */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl ${
                        film.rank === 1
                          ? "bg-yellow-500 text-black"
                          : film.rank === 2
                          ? "bg-gray-400 text-black"
                          : film.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {film.rank}
                    </div>

                    {/* Poster */}
                    <img
                      src={film.poster_url ? `http://localhost:5000${film.poster_url}` : "/placeholder.jpg"}
                      alt={film.title}
                      className="w-16 h-24 object-cover rounded"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{film.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {film.director_firstname} {film.director_lastname}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-400">
                        {film.avg_rating}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {film.rating_count} votes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Film Modal */}
      {selectedFilm && (
        <FilmModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          onRate={handleRate}
          userRating={selectedFilm.userRating}
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
        />
      )}
    </div>
  );
}
