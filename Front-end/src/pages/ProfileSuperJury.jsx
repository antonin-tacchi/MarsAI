import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFilmsForSuperJury,
  getJuryMembers,
  assignFilmsToJury,
  getJuryAssignedFilms,
  removeFilmAssignment,
} from "../services/filmService";
import { getCurrentUser, logout, isSuperJury, isAdmin } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Rating Progress Component
function RatingProgress({ current, required }) {
  const percentage = Math.min((current / required) * 100, 100);
  const isComplete = current >= required;

  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-xs font-medium ${isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
        {current}/{required}
      </span>
    </div>
  );
}

// Film Card for selection
function FilmCard({ film, isSelected, onToggle, minRatings = 3 }) {
  const thumbnailUrl = film.thumbnail_url
    ? film.thumbnail_url.startsWith("http")
      ? film.thumbnail_url
      : `${API_URL}${film.thumbnail_url}`
    : film.poster_url
    ? film.poster_url.startsWith("http")
      ? film.poster_url
      : `${API_URL}${film.poster_url}`
    : null;

  const ratingCount = film.rating_count || 0;
  const isReviewComplete = ratingCount >= minRatings;

  return (
    <div
      onClick={() => !isReviewComplete && onToggle(film.id)}
      className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
        isReviewComplete
          ? "opacity-50 cursor-not-allowed"
          : isSelected
          ? "ring-4 ring-purple-500 scale-105 cursor-pointer"
          : "hover:scale-102 hover:shadow-lg cursor-pointer"
      }`}
    >
      <div className="aspect-video bg-gray-800">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <span className="text-3xl">🎬</span>
          </div>
        )}
      </div>

      {/* Rating badge */}
      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
        isReviewComplete ? 'bg-green-600 text-white' : 'bg-yellow-600 text-black'
      }`}>
        {ratingCount}/{minRatings} notes
      </div>

      {/* Selection overlay */}
      {isSelected && !isReviewComplete && (
        <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Complete overlay */}
      {isReviewComplete && (
        <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Evaluation complete
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        <h3 className="text-white text-sm font-medium truncate">{film.title}</h3>
        <p className="text-gray-300 text-xs truncate mb-1">
          {film.director_firstname} {film.director_lastname}
        </p>
        <RatingProgress current={ratingCount} required={minRatings} />
        {film.assignment_count > 0 && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
            {film.assignment_count} jury assignes
          </span>
        )}
      </div>
    </div>
  );
}

// Jury Member Card
function JuryMemberCard({ member, isSelected, onSelect, assignedFilms }) {
  return (
    <div
      onClick={() => onSelect(member)}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-purple-600 text-white"
          : "bg-gray-800 text-gray-200 hover:bg-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{member.name}</h3>
          <p className={`text-sm ${isSelected ? "text-purple-200" : "text-gray-400"}`}>
            {member.email}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${isSelected ? "text-white" : "text-purple-400"}`}>
            {member.assigned_films}
          </div>
          <p className={`text-xs ${isSelected ? "text-purple-200" : "text-gray-500"}`}>
            films
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-2 text-xs">
        <span className={`px-2 py-1 rounded ${isSelected ? "bg-purple-500" : "bg-gray-700"}`}>
          {member.rated_films} notes
        </span>
      </div>
    </div>
  );
}

// Main Component
export default function ProfileSuperJury() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [films, setFilms] = useState([]);
  const [completedFilms, setCompletedFilms] = useState([]);
  const [stats, setStats] = useState({ total_pending: 0, needs_review: 0, review_complete: 0, minRatingsRequired: 3 });
  const [juryMembers, setJuryMembers] = useState([]);
  const [selectedFilms, setSelectedFilms] = useState([]);
  const [selectedJury, setSelectedJury] = useState(null);
  const [juryAssignedFilms, setJuryAssignedFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!isSuperJury() && !isAdmin()) {
      navigate("/dashboard");
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filmsRes, membersRes] = await Promise.all([
        getFilmsForSuperJury(),
        getJuryMembers(),
      ]);
      setFilms(filmsRes.data || []);
      setCompletedFilms(filmsRes.completed || []);
      setStats(filmsRes.stats || { total_pending: 0, needs_review: 0, review_complete: 0, minRatingsRequired: 3 });
      setJuryMembers(membersRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJury = async (member) => {
    setSelectedJury(member);
    try {
      const res = await getJuryAssignedFilms(member.id);
      setJuryAssignedFilms(res.data || []);
    } catch (err) {
      console.error("Error loading jury assignments:", err);
    }
  };

  const handleToggleFilm = (filmId) => {
    setSelectedFilms((prev) =>
      prev.includes(filmId)
        ? prev.filter((id) => id !== filmId)
        : [...prev, filmId]
    );
  };

  const handleAssignFilms = async () => {
    if (!selectedJury || selectedFilms.length === 0) return;

    setAssigning(true);
    try {
      await assignFilmsToJury(selectedJury.id, selectedFilms);
      alert(`${selectedFilms.length} film(s) assigne(s) a ${selectedJury.name}`);
      setSelectedFilms([]);
      loadData();
      handleSelectJury(selectedJury);
    } catch (err) {
      alert("Erreur: " + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (filmId) => {
    if (!selectedJury) return;
    if (!confirm("Retirer ce film de la liste du jury?")) return;

    try {
      await removeFilmAssignment(selectedJury.id, filmId);
      handleSelectJury(selectedJury);
      loadData();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleSelectAll = () => {
    if (selectedFilms.length === films.length) {
      setSelectedFilms([]);
    } else {
      setSelectedFilms(films.map((f) => f.id));
    }
  };

  const handleSelectRandom50 = () => {
    const shuffled = [...films].sort(() => 0.5 - Math.random());
    setSelectedFilms(shuffled.slice(0, 50).map((f) => f.id));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement...</p>
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
            <h1 className="text-2xl font-bold text-purple-500">MarsAI</h1>
            <span className="text-gray-400">|</span>
            <span className="text-white font-medium">Super Jury</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              {user?.name}
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-400">{stats.needs_review || films.length}</div>
            <div className="text-gray-400 text-sm">A evaluer (&lt;{stats.minRatingsRequired} notes)</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-400">{stats.review_complete || completedFilms.length}</div>
            <div className="text-gray-400 text-sm">Evaluation complete</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-purple-400">{juryMembers.length}</div>
            <div className="text-gray-400 text-sm">Membres du jury</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-400">{selectedFilms.length}</div>
            <div className="text-gray-400 text-sm">Films selectionnes</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-purple-600">
            <div className="text-3xl font-bold text-white">{stats.minRatingsRequired}</div>
            <div className="text-gray-400 text-sm">Notes requises/film</div>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-purple-200 text-sm">
                <strong>Systeme d'evaluation:</strong> Chaque film doit etre note par au moins <strong>{stats.minRatingsRequired} jurys differents</strong>.
                Une fois ce seuil atteint, le film est retire de la liste d'assignation.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Jury Members */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-xl font-bold text-white mb-4">Membres du Jury</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {juryMembers.map((member) => (
                  <JuryMemberCard
                    key={member.id}
                    member={member}
                    isSelected={selectedJury?.id === member.id}
                    onSelect={handleSelectJury}
                    assignedFilms={juryAssignedFilms}
                  />
                ))}
                {juryMembers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Aucun membre du jury
                  </p>
                )}
              </div>
            </div>

            {/* Selected Jury's Films */}
            {selectedJury && (
              <div className="bg-gray-900 rounded-xl p-4 mt-4">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Films de {selectedJury.name}
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {juryAssignedFilms.map((film) => (
                    <div
                      key={film.film_id}
                      className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        {(film.thumbnail_url || film.poster_url) && (
                          <img
                            src={
                              (film.thumbnail_url || film.poster_url).startsWith("http")
                                ? film.thumbnail_url || film.poster_url
                                : `${API_URL}${film.thumbnail_url || film.poster_url}`
                            }
                            alt={film.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium truncate max-w-[150px]">
                            {film.title}
                          </p>
                          {film.jury_rating && (
                            <span className="text-yellow-400 text-xs">
                              Note: {film.jury_rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(film.film_id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Retirer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {juryAssignedFilms.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-2">
                      Aucun film assigne
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Films Grid */}
          <div className="lg:col-span-2">
            {/* Toggle between films to assign and completed */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCompleted(false)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  !showCompleted
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                A evaluer ({films.length})
              </button>
              <button
                onClick={() => setShowCompleted(true)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                  showCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                Evaluation complete ({completedFilms.length})
              </button>
            </div>

            <div className="bg-gray-900 rounded-xl p-4">
              {!showCompleted ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Films a assigner
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectRandom50}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
                      >
                        50 aleatoires
                      </button>
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                      >
                        {selectedFilms.length === films.length ? "Deselectionner" : "Tout selectionner"}
                      </button>
                    </div>
                  </div>

                  {/* Films Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
                    {films.map((film) => (
                      <FilmCard
                        key={film.id}
                        film={film}
                        isSelected={selectedFilms.includes(film.id)}
                        onToggle={handleToggleFilm}
                        minRatings={stats.minRatingsRequired}
                      />
                    ))}
                  </div>

                  {films.length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">🎉</span>
                      <p className="text-gray-400">Tous les films ont ete evalues!</p>
                    </div>
                  )}

                  {/* Assign Button */}
                  {selectedJury && selectedFilms.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <button
                        onClick={handleAssignFilms}
                        disabled={assigning}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                      >
                        {assigning
                          ? "Assignation en cours..."
                          : `Assigner ${selectedFilms.length} film(s) a ${selectedJury.name}`}
                      </button>
                    </div>
                  )}

                  {!selectedJury && selectedFilms.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-yellow-400 text-center">
                        Selectionnez un membre du jury pour assigner les films
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-white">
                      Films avec {stats.minRatingsRequired}+ notes
                    </h2>
                    <span className="text-green-400 text-sm">
                      Prets pour la decision finale
                    </span>
                  </div>

                  {/* Completed Films Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
                    {completedFilms.map((film) => (
                      <div key={film.id} className="relative rounded-lg overflow-hidden">
                        <div className="aspect-video bg-gray-800">
                          {(film.thumbnail_url || film.poster_url) ? (
                            <img
                              src={(film.thumbnail_url || film.poster_url).startsWith("http")
                                ? film.thumbnail_url || film.poster_url
                                : `${API_URL}${film.thumbnail_url || film.poster_url}`}
                              alt={film.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                              <span className="text-3xl">🎬</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-green-600 text-white">
                          {film.average_rating ? parseFloat(film.average_rating).toFixed(1) : "-"} ★
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                          <h3 className="text-white text-sm font-medium truncate">{film.title}</h3>
                          <p className="text-gray-300 text-xs truncate">
                            {film.rating_count} notes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {completedFilms.length === 0 && (
                    <div className="text-center py-12">
                      <span className="text-5xl mb-4 block">⏳</span>
                      <p className="text-gray-400">Aucun film n'a encore atteint {stats.minRatingsRequired} notes</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
