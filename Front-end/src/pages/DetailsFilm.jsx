import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaUser, FaCalendar, FaMapMarkerAlt, FaTools, FaPlay } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

// Format date to French locale
const formatDate = (dateString) => {
  if (!dateString) return "Date inconnue";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// YouTube Video Player component
const VideoPlayer = ({ youtubeUrl, title }) => {
  const videoId = getYouTubeId(youtubeUrl);

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Vidéo non disponible</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

// Film card for sidebar
const FilmCard = ({ film }) => {
  const thumbnailUrl = film.thumbnail_url ||
    (film.youtube_url ? `https://img.youtube.com/vi/${getYouTubeId(film.youtube_url)}/mqdefault.jpg` : null);

  return (
    <Link
      to={`/film/${film.id}`}
      className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
    >
      <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={film.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <FaPlay className="text-gray-500" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-[#262335] text-sm line-clamp-2 group-hover:text-[#463699]">
          {film.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {film.director_firstname} {film.director_lastname}
        </p>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {film.description?.substring(0, 60)}...
        </p>
      </div>
    </Link>
  );
};

export default function DetailsFilm() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [otherFilms, setOtherFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch main film
        const filmRes = await fetch(`${API_URL}/films/public/${id}`);
        const filmData = await filmRes.json();

        if (!filmData.success) {
          throw new Error(filmData.message || "Film non trouvé");
        }

        setFilm(filmData.data);

        // Fetch other films for sidebar
        const catalogRes = await fetch(`${API_URL}/films/public/catalog`);
        const catalogData = await catalogRes.json();

        if (catalogData.success) {
          // Filter out current film and limit to 5
          const others = catalogData.data
            .filter((f) => f.id !== parseInt(id))
            .slice(0, 5);
          setOtherFilms(others);
        }
      } catch (err) {
        console.error("Error fetching film:", err);
        setError(err.message || "Erreur lors du chargement du film");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#463699] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Chargement du film...</p>
        </div>
      </div>
    );
  }

  if (error || !film) {
    return (
      <div className="min-h-screen bg-[#FBF5F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-2xl font-bold text-[#262335] mb-2">Film non trouvé</h1>
          <p className="text-gray-600 mb-6">{error || "Ce film n'existe pas ou n'est pas encore disponible."}</p>
          <Link
            to="/catalogs"
            className="inline-block bg-[#262335] text-white px-6 py-3 rounded-full font-bold hover:bg-[#463699] transition-colors"
          >
            Voir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5F0]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <VideoPlayer youtubeUrl={film.youtube_url} title={film.title} />

            {/* Film Info */}
            <div className="mt-6">
              <h1 className="text-2xl md:text-3xl font-black text-[#262335] mb-4">
                {film.title}
              </h1>

              {/* Director info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#463699] flex items-center justify-center text-white">
                  <FaUser className="text-lg" />
                </div>
                <div>
                  <p className="font-bold text-[#262335]">
                    {film.director_firstname} {film.director_lastname}
                  </p>
                  {film.director_school && (
                    <p className="text-sm text-gray-500">{film.director_school}</p>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-[#463699]" />
                  <span>{formatDate(film.created_at)}</span>
                </div>
                {film.country && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#463699]" />
                    <span>{film.country}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-bold text-[#262335] mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {film.description}
                </p>
              </div>

              {/* AI Tools */}
              {film.ai_tools_used && (
                <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTools className="text-[#463699]" />
                    <h3 className="font-bold text-[#262335]">Outils IA utilisés</h3>
                  </div>
                  <p className="text-gray-600">{film.ai_tools_used}</p>
                </div>
              )}

              {/* Director Bio */}
              {film.director_bio && (
                <div className="p-4 bg-white rounded-xl shadow-sm">
                  <h3 className="font-bold text-[#262335] mb-2">À propos du réalisateur</h3>
                  <p className="text-gray-600">{film.director_bio}</p>

                  {/* Social links */}
                  <div className="flex gap-4 mt-4">
                    {film.social_instagram && (
                      <a
                        href={film.social_instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#463699] hover:underline text-sm"
                      >
                        Instagram
                      </a>
                    )}
                    {film.social_youtube && (
                      <a
                        href={film.social_youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#463699] hover:underline text-sm"
                      >
                        YouTube
                      </a>
                    )}
                    {film.social_vimeo && (
                      <a
                        href={film.social_vimeo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#463699] hover:underline text-sm"
                      >
                        Vimeo
                      </a>
                    )}
                    {film.director_website && (
                      <a
                        href={film.director_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#463699] hover:underline text-sm"
                      >
                        Site web
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Other films */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold text-[#262335] mb-4">
                Autres films
              </h2>

              {otherFilms.length > 0 ? (
                <div className="space-y-2">
                  {otherFilms.map((f) => (
                    <FilmCard key={f.id} film={f} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aucun autre film disponible</p>
              )}

              {/* CTA to see full catalog */}
              <Link
                to="/catalogs"
                className="block mt-6 text-center bg-[#262335] text-white py-3 px-6 rounded-full font-bold hover:bg-[#463699] transition-colors"
              >
                Voir tout le catalogue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
