import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { FaTrophy } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const RANK_STYLES = {
  1: "bg-yellow-400 text-yellow-900",
  2: "bg-gray-300 text-gray-800",
  3: "bg-amber-600 text-amber-100",
};

export default function PrizeList() {
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/films/ranking`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error");
        setRanking(json.data || []);
      } catch (err) {
        console.error("Ranking error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#262335] flex items-center justify-center gap-3">
            <FaTrophy className="text-yellow-500" />
            {t("prizeList.title")}
          </h1>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-[#262335]/20 border-t-[#463699] rounded-full animate-spin mb-4" />
            <p className="text-[#262335]/60">{t("prizeList.loading")}</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium">{t("prizeList.error")}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && ranking.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-[#262335]/60 mb-2">{t("prizeList.noResults")}</p>
            <p className="text-[#262335]/40">{t("prizeList.noResultsDesc")}</p>
          </div>
        )}

        {/* Ranking table */}
        {!loading && !error && ranking.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#262335]/10 bg-[#262335] text-white">
                    <th className="py-4 px-4 font-bold text-center w-16">{t("prizeList.rank")}</th>
                    <th className="py-4 px-4 font-bold">{t("prizeList.film")}</th>
                    <th className="py-4 px-4 font-bold">{t("prizeList.director")}</th>
                    <th className="py-4 px-4 font-bold">{t("prizeList.country")}</th>
                    <th className="py-4 px-4 font-bold text-center">{t("prizeList.averageRating")}</th>
                    <th className="py-4 px-4 font-bold text-center">{t("prizeList.votes")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((film) => (
                    <tr key={film.film_id} className="border-b border-[#262335]/5 hover:bg-[#463699]/5 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${RANK_STYLES[film.rank] || "bg-[#262335]/10 text-[#262335]"}`}>
                          {film.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {film.thumbnail_url && (
                            <img
                              src={`${API_URL}${film.thumbnail_url}`}
                              alt={film.title}
                              className="w-12 h-8 object-cover rounded"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          )}
                          <span className="font-semibold text-[#262335]">{film.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#262335]/70">{film.director}</td>
                      <td className="py-4 px-4 text-[#262335]/70">{film.country}</td>
                      <td className="py-4 px-4 text-center">
                        {film.average_rating !== null ? (
                          <span className="font-bold text-[#463699] text-lg">{film.average_rating.toFixed(1)}<span className="text-xs text-[#262335]/40">/10</span></span>
                        ) : (
                          <span className="text-[#262335]/30 text-xs italic">{t("prizeList.noRating")}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-[#262335]/10 text-[#262335] text-xs font-bold px-3 py-1 rounded-full">{film.rating_count}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#262335]/5">
              {ranking.map((film) => (
                <div key={film.film_id} className="p-4 flex items-start gap-3">
                  <span className={`flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${RANK_STYLES[film.rank] || "bg-[#262335]/10 text-[#262335]"}`}>
                    {film.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#262335] truncate">{film.title}</p>
                    <p className="text-sm text-[#262335]/60">{film.director}</p>
                    {film.country && <p className="text-xs text-[#262335]/40">{film.country}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    {film.average_rating !== null ? (
                      <p className="font-bold text-[#463699]">{film.average_rating.toFixed(1)}<span className="text-xs text-[#262335]/40">/10</span></p>
                    ) : (
                      <p className="text-xs text-[#262335]/30 italic">{t("prizeList.noRating")}</p>
                    )}
                    <p className="text-xs text-[#262335]/40">{film.rating_count} {t("prizeList.votes").toLowerCase()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
