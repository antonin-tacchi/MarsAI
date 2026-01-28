import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(film)}
    >
      {/* Poster */}
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
        {/* Header with Poster Background */}
        <div className="relative h-64 md:h-80">
          <img
            src={film.thumbnail_url ? `http://localhost:5000${film.thumbnail_url}` : film.poster_url ? `http://localhost:5000${film.poster_url}` : "/placeholder.jpg"}
            alt={film.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-20 relative">
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
        </div>
      </div>
    </div>
  );
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
    } finally {
      setLoading(false);
    }
  };

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
      </div>
    );
  }

  return (
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
        />
      )}
    </div>
  );
}
