import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(film)}
    >
      {/* Poster */}
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
        </div>
      </div>
    </div>
  );
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
    } finally {
      setLoading(false);
    }
  };

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
      </div>
    );
  }

  return (
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
        />
      )}
    </div>
  );
}
