import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const MEDAL_CONFIG = {
  1: { emoji: "🥇", bg: "bg-yellow-400", text: "text-yellow-900", bar: "bg-yellow-400", key: "medalGold" },
  2: { emoji: "🥈", bg: "bg-gray-300", text: "text-gray-800", bar: "bg-gray-300", key: "medalSilver" },
  3: { emoji: "🥉", bg: "bg-amber-600", text: "text-amber-100", bar: "bg-amber-600", key: "medalBronze" },
};

function StarRating({ value, max = 10 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 rounded-full bg-[#262335]/10 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#463699] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-black text-[#463699] text-lg tabular-nums">
        {value.toFixed(1)}
        <span className="text-xs font-normal text-[#262335]/30">/10</span>
      </span>
    </div>
  );
}

function PodiumCard({ film, index, t }) {
  const medal = MEDAL_CONFIG[film.rank] || {};
  const isFirst = film.rank === 1;

  return (
    <div
      className={`relative flex flex-col items-center text-center ${
        isFirst ? "md:-translate-y-6 z-10" : ""
      }`}
      style={{ animation: `fadeUp 0.5s ease ${index * 0.12}s both` }}
    >
      {/* Rank badge */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 shadow-lg ${medal.bg} ${medal.text}`}
      >
        {medal.emoji}
      </div>

      {/* Card */}
      <div
        className={`w-full bg-white rounded-2xl overflow-hidden shadow-md border-2 ${
          isFirst ? "border-yellow-400 shadow-yellow-200/60 shadow-xl" : "border-transparent"
        }`}
      >
        {film.thumbnail_url ? (
          <div className="relative h-40 overflow-hidden">
            <img
              src={`${API_URL}${film.thumbnail_url}`}
              alt={film.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#262335]/60 to-transparent" />
          </div>
        ) : (
          <div className="h-40 bg-[#262335]/5 flex items-center justify-center text-5xl">🎬</div>
        )}

        <div className="p-4">
          <p className="font-black text-[#262335] text-base leading-snug mb-1 uppercase tracking-tight">
            {film.title}
          </p>
          <p className="text-xs text-[#262335]/50 mb-3">{film.director} · {film.country}</p>
          {film.average_rating !== null ? (
            <StarRating value={film.average_rating} />
          ) : null}
          <p className="text-xs text-[#262335]/30 mt-2">{film.rating_count} votes</p>
        </div>
      </div>

      {/* Podium step */}
      <div
        className={`w-full mt-3 rounded-b-xl flex items-center justify-center font-black tracking-widest text-xs py-2 ${medal.bg} ${medal.text}`}
        style={{ minHeight: isFirst ? 56 : film.rank === 2 ? 40 : 28 }}
      >
        {medal.key ? t(`prizeList.${medal.key}`) : ""}
      </div>
    </div>
  );
}

function TableRow({ film, index }) {
  const medal = MEDAL_CONFIG[film.rank];

  return (
    <tr
      className="border-b border-[#262335]/5 hover:bg-[#463699]/4 transition-colors group"
      style={{ animation: `fadeUp 0.4s ease ${index * 0.04}s both` }}
    >
      {/* Rank */}
      <td className="py-4 px-5 text-center w-16">
        {medal ? (
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full font-black text-sm ${medal.bg} ${medal.text}`}
          >
            {film.rank}
          </span>
        ) : (
          <span className="text-[#262335]/30 font-bold text-sm tabular-nums">{film.rank}</span>
        )}
      </td>

      {/* Film */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {film.thumbnail_url ? (
            <div className="w-14 h-9 rounded overflow-hidden flex-shrink-0">
              <img
                src={`${API_URL}${film.thumbnail_url}`}
                alt={film.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.parentElement.style.display = "none"; }}
              />
            </div>
          ) : (
            <div className="w-14 h-9 rounded bg-[#262335]/5 flex items-center justify-center text-lg flex-shrink-0">🎬</div>
          )}
          <span className="font-black text-[#262335] uppercase tracking-tight text-sm group-hover:text-[#463699] transition-colors">
            {film.title}
          </span>
        </div>
      </td>

      {/* Director */}
      <td className="py-4 px-4 text-sm text-[#262335]/60 hidden md:table-cell">{film.director}</td>

      {/* Country */}
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="text-xs font-bold bg-[#262335]/6 text-[#262335]/60 px-2 py-1 rounded-full">
          {film.country}
        </span>
      </td>

      {/* Rating */}
      <td className="py-4 px-4 text-center">
        {film.average_rating !== null ? (
          <StarRating value={film.average_rating} />
        ) : (
          <span className="text-xs text-[#262335]/20 italic">—</span>
        )}
      </td>

      {/* Votes */}
      <td className="py-4 px-5 text-center">
        <span className="text-xs font-bold text-[#262335]/40 tabular-nums">{film.rating_count}</span>
      </td>
    </tr>
  );
}

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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const top3 = ranking.filter((f) => f.rank <= 3).sort((a, b) => {
    // order: 2, 1, 3 for visual podium
    const order = { 1: 1, 2: 0, 3: 2 };
    return order[a.rank] - order[b.rank];
  });
  const rest = ranking.filter((f) => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #262335/8 25%, #262335/15 50%, #262335/8 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
        }
      `}</style>

      <div className="bg-[#FBF5F0] min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">

          {/* ── HEADER ── */}
          <div className="mb-14" style={{ animation: "fadeUp 0.5s ease both" }}>
            <p className="text-xs font-black tracking-[0.3em] text-[#463699] uppercase mb-3">
              {t("prizeList.festivalLabel")}
            </p>
            <h1 className="text-5xl md:text-6xl font-black text-[#262335] uppercase tracking-tighter italic leading-none">
              {t("prizeList.title")}
            </h1>
            <div className="mt-4 h-1 w-16 bg-[#463699] rounded-full" />
          </div>

          {/* ── LOADING ── */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block w-10 h-10 border-4 border-[#262335]/10 border-t-[#463699] rounded-full animate-spin mb-4" />
              <p className="text-sm text-[#262335]/40 tracking-widest uppercase">{t("prizeList.loading")}</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {!loading && error && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="font-black text-red-500 uppercase">{t("prizeList.error")}</p>
            </div>
          )}

          {/* ── EMPTY ── */}
          {!loading && !error && ranking.length === 0 && (
            <div className="text-center py-24 border-2 border-dashed border-[#262335]/10 rounded-3xl">
              <div className="text-6xl mb-4 opacity-20">🏆</div>
              <p className="text-xl font-black text-[#262335]/40 uppercase tracking-tight">
                {t("prizeList.noResults")}
              </p>
              <p className="text-sm text-[#262335]/30 mt-2">{t("prizeList.noResultsDesc")}</p>
            </div>
          )}

          {/* ── CONTENT ── */}
          {!loading && !error && ranking.length > 0 && (
            <>
              {/* PODIUM TOP 3 */}
              {top3.length > 0 && (
                <div className="mb-16">
                  <p className="text-xs font-black tracking-[0.25em] text-[#262335]/30 uppercase mb-8">
                    — {t("prizeList.podiumLabel")}
                  </p>
                  <div className="grid grid-cols-3 gap-4 md:gap-6 items-end max-w-2xl mx-auto">
                    {top3.map((film, i) => (
                      <PodiumCard key={film.film_id} film={film} index={i} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {/* REST TABLE */}
              {rest.length > 0 && (
                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-[#262335]/30 uppercase mb-6">
                    — {t("prizeList.rankingLabel")}
                  </p>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-[#262335] text-white">
                            <th className="py-4 px-5 font-black text-center w-16 text-xs tracking-widest uppercase">#</th>
                            <th className="py-4 px-4 font-black text-xs tracking-widest uppercase">{t("prizeList.film")}</th>
                            <th className="py-4 px-4 font-black text-xs tracking-widest uppercase hidden md:table-cell">{t("prizeList.director")}</th>
                            <th className="py-4 px-4 font-black text-xs tracking-widest uppercase hidden lg:table-cell">{t("prizeList.country")}</th>
                            <th className="py-4 px-4 font-black text-xs tracking-widest uppercase">{t("prizeList.averageRating")}</th>
                            <th className="py-4 px-5 font-black text-xs tracking-widest uppercase text-center">{t("prizeList.votes")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rest.map((film, i) => (
                            <TableRow key={film.film_id} film={film} index={i} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile cards for rest */}
              {rest.length > 0 && (
                <div className="md:hidden mt-2 bg-white rounded-2xl shadow-sm overflow-hidden">
                  {rest.map((film, i) => (
                    <div
                      key={film.film_id}
                      className="flex items-start gap-3 p-4 border-b border-[#262335]/5 last:border-0"
                      style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#262335]/8 text-[#262335]/50 text-xs font-black flex items-center justify-center tabular-nums">
                        {film.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-[#262335] text-sm uppercase tracking-tight truncate">{film.title}</p>
                        <p className="text-xs text-[#262335]/50">{film.director}</p>
                        {film.country && <p className="text-xs text-[#262335]/30">{film.country}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {film.average_rating !== null ? (
                          <p className="font-black text-[#463699] text-base">{film.average_rating.toFixed(1)}<span className="text-xs text-[#262335]/30">/10</span></p>
                        ) : (
                          <p className="text-xs text-[#262335]/20">—</p>
                        )}
                        <p className="text-xs text-[#262335]/30">{film.rating_count} votes</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}