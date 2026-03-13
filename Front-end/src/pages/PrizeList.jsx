import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ── Medal config ── */
const MEDAL = {
  1: {
    label: "medalGold",
    barBg:   "bg-gradient-to-r from-[#B8962E] to-[#FFD700]",
    cardBorder: "border-[#C9A84C]/70",
    cardGlow:   "shadow-[0_0_32px_rgba(201,168,76,0.25)]",
    badgeBg:  "bg-gradient-to-br from-[#C9A84C] to-[#FFD700]",
    rankColor:"text-[#0A0A0F]",
    stepBg:   "bg-gradient-to-r from-[#B8962E] via-[#E8C97A] to-[#B8962E]",
    stepText: "text-[#0A0A0F]",
  },
  2: {
    label: "medalSilver",
    barBg:   "bg-gradient-to-r from-[#8A8A8A] to-[#D4D5D8]",
    cardBorder: "border-[#A8A9AD]/40",
    cardGlow:   "shadow-[0_0_20px_rgba(168,169,173,0.15)]",
    badgeBg:  "bg-gradient-to-br from-[#8A8A8A] to-[#D4D5D8]",
    rankColor:"text-[#0A0A0F]",
    stepBg:   "bg-gradient-to-r from-[#6B6C70] to-[#A8A9AD]",
    stepText: "text-[#F5F0E8]",
  },
  3: {
    label: "medalBronze",
    barBg:   "bg-gradient-to-r from-[#7C4B2E] to-[#C47A3A]",
    cardBorder: "border-[#C47A3A]/40",
    cardGlow:   "shadow-[0_0_20px_rgba(196,122,58,0.15)]",
    badgeBg:  "bg-gradient-to-br from-[#7C4B2E] to-[#C47A3A]",
    rankColor:"text-[#F5F0E8]",
    stepBg:   "bg-gradient-to-r from-[#7C4B2E] to-[#C47A3A]",
    stepText: "text-[#F5F0E8]",
  },
};

/* ── Gold star rating bar ── */
function RatingBar({ value, max = 10 }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-1 w-20 rounded-full bg-[#C9A84C]/15 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-bold text-[#C9A84C] text-base tabular-nums">
        {value.toFixed(1)}<span className="text-[10px] font-normal text-[#C8C0B0]/50">/10</span>
      </span>
    </div>
  );
}

/* ── Podium card ── */
function PodiumCard({ film, index, t }) {
  const m = MEDAL[film.rank] || MEDAL[3];
  const isFirst = film.rank === 1;

  return (
    <div
      className={`relative flex flex-col items-center text-center ${isFirst ? "md:-translate-y-8 z-10" : ""}`}
      style={{ animation: `fadeUp 0.5s ease ${index * 0.12}s both` }}
    >
      {/* Medal badge */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl mb-4 ${m.badgeBg} ${m.rankColor} ${isFirst ? "shadow-[0_0_20px_rgba(201,168,76,0.6)]" : "shadow-md"}`}>
        {film.rank}
      </div>

      {/* Card */}
      <div className={`w-full bg-[#12121A] rounded border-2 overflow-hidden ${m.cardBorder} ${isFirst ? m.cardGlow : ""} transition-all duration-300`}>
        {film.thumbnail_url ? (
          <div className="relative h-36 overflow-hidden">
            <img
              src={`${API_URL}${film.thumbnail_url}`}
              alt={film.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/80 to-transparent" />
          </div>
        ) : (
          <div className="h-36 bg-[#1E1E2E] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#C9A84C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
            </svg>
          </div>
        )}

        <div className="p-4 text-left">
          <p className="font-display font-bold text-white text-sm leading-snug mb-1 truncate">
            {film.title}
          </p>
          <p className="text-[11px] text-[#C8C0B0]/60 mb-3 truncate">{film.director} · {film.country}</p>
          {film.average_rating !== null
            ? <RatingBar value={film.average_rating} />
            : <span className="text-[11px] text-[#C8C0B0]/30 italic">Non noté</span>}
          <p className="text-[10px] text-[#C8C0B0]/30 mt-1.5">{film.rating_count} votes</p>
        </div>
      </div>

      {/* Podium step label */}
      <div
        className={`w-full mt-2 flex items-center justify-center font-bold tracking-[0.25em] text-[10px] uppercase py-2.5 ${m.stepBg} ${m.stepText}`}
        style={{ minHeight: isFirst ? 52 : film.rank === 2 ? 38 : 28 }}
      >
        {t(`prizeList.${m.label}`)}
      </div>
    </div>
  );
}

/* ── Table row ── */
function TableRow({ film, index }) {
  const m = MEDAL[film.rank];

  return (
    <tr
      className="border-b border-[#C9A84C]/8 hover:bg-[#C9A84C]/5 transition-colors group"
      style={{ animation: `fadeUp 0.4s ease ${index * 0.04}s both` }}
    >
      {/* Rank */}
      <td className="py-4 px-5 text-center w-14">
        {m ? (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-black text-xs ${m.badgeBg} ${m.rankColor}`}>
            {film.rank}
          </span>
        ) : (
          <span className="text-[#C8C0B0]/30 font-bold text-sm tabular-nums">{film.rank}</span>
        )}
      </td>

      {/* Film */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          {film.thumbnail_url ? (
            <div className="w-14 h-9 rounded overflow-hidden flex-shrink-0 border border-[#C9A84C]/10">
              <img src={`${API_URL}${film.thumbnail_url}`} alt={film.title} className="w-full h-full object-cover"
                onError={(e) => { e.target.parentElement.style.display = "none"; }} />
            </div>
          ) : (
            <div className="w-14 h-9 rounded bg-[#1E1E2E] flex items-center justify-center flex-shrink-0 border border-[#C9A84C]/10">
              <svg className="w-4 h-4 text-[#C9A84C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              </svg>
            </div>
          )}
          <span className="font-display font-bold text-[#F5F0E8] text-sm group-hover:text-[#C9A84C] transition-colors truncate">
            {film.title}
          </span>
        </div>
      </td>

      {/* Director */}
      <td className="py-4 px-4 text-[13px] text-[#C8C0B0]/60 hidden md:table-cell">{film.director}</td>

      {/* Country */}
      <td className="py-4 px-4 hidden lg:table-cell">
        <span className="text-[11px] font-semibold border border-[#C9A84C]/15 text-[#C8C0B0]/60 px-2.5 py-1 rounded">
          {film.country}
        </span>
      </td>

      {/* Rating */}
      <td className="py-4 px-4">
        {film.average_rating !== null
          ? <RatingBar value={film.average_rating} />
          : <span className="text-[11px] text-[#C8C0B0]/25 italic">—</span>}
      </td>

      {/* Votes */}
      <td className="py-4 px-5 text-center">
        <span className="text-[12px] font-bold text-[#C8C0B0]/40 tabular-nums">{film.rating_count}</span>
      </td>
    </tr>
  );
}

/* ── Page ── */
export default function PrizeList() {
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res  = await fetch(`${API_URL}/api/films/ranking`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error");
        setRanking(json.data || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const top3 = ranking.filter(f => f.rank <= 3).sort((a, b) => {
    const order = { 1: 1, 2: 0, 3: 2 }; // visual order: 2-1-3
    return order[a.rank] - order[b.rank];
  });
  const rest = ranking.filter(f => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <div className="bg-[#0A0A0F] min-h-screen">
        {/* Gold top line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">

          {/* Header */}
          <div className="mb-16" style={{ animation: "fadeUp 0.5s ease both" }}>
            <p className="text-[10px] font-semibold tracking-[0.45em] uppercase text-[#C9A84C] mb-3">
              {t("prizeList.festivalLabel")}
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-black text-white leading-none mb-4">
              {t("prizeList.title")}
            </h1>
            <div className="w-14 h-px bg-gradient-to-r from-[#C9A84C] to-transparent" />
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin mb-4" />
              <p className="text-[12px] text-[#C8C0B0]/40 tracking-[0.3em] uppercase">{t("prizeList.loading")}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20 border border-[#8B1A2E]/30 rounded bg-[#8B1A2E]/10 p-8">
              <p className="font-bold text-[#E8607A] uppercase tracking-widest">{t("prizeList.error")}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && ranking.length === 0 && (
            <div className="text-center py-24 border border-[#C9A84C]/10 rounded">
              <svg className="w-14 h-14 text-[#C9A84C]/15 mx-auto mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="font-display text-xl font-bold text-[#C8C0B0]/30 uppercase">{t("prizeList.noResults")}</p>
              <p className="text-[13px] text-[#C8C0B0]/20 mt-2">{t("prizeList.noResultsDesc")}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && ranking.length > 0 && (
            <>
              {/* ── Podium top 3 ── */}
              {top3.length > 0 && (
                <div className="mb-20">
                  <div className="flex items-center gap-4 mb-10">
                    <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C9A84C]">
                      — {t("prizeList.podiumLabel")}
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto">
                    {top3.map((film, i) => (
                      <PodiumCard key={film.film_id} film={film} index={i} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── Full ranking table ── */}
              {rest.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <p className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[#C9A84C]">
                      — {t("prizeList.rankingLabel")}
                    </p>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent" />
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block border border-[#C9A84C]/15 rounded overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="bg-[#12121A] border-b border-[#C9A84C]/20">
                            <th className="py-4 px-5 text-center w-14 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C]">#</th>
                            <th className="py-4 px-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C]">{t("prizeList.film")}</th>
                            <th className="py-4 px-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C] hidden md:table-cell">{t("prizeList.director")}</th>
                            <th className="py-4 px-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C] hidden lg:table-cell">{t("prizeList.country")}</th>
                            <th className="py-4 px-4 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C]">{t("prizeList.averageRating")}</th>
                            <th className="py-4 px-5 text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C] text-center">{t("prizeList.votes")}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-[#0A0A0F]">
                          {rest.map((film, i) => (
                            <TableRow key={film.film_id} film={film} index={i} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile cards */}
                  <div className="md:hidden border border-[#C9A84C]/15 rounded overflow-hidden divide-y divide-[#C9A84C]/8">
                    {rest.map((film, i) => (
                      <div
                        key={film.film_id}
                        className="flex items-start gap-3 p-4 bg-[#0A0A0F] hover:bg-[#12121A] transition-colors"
                        style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
                      >
                        <span className="flex-shrink-0 w-8 h-8 rounded bg-[#1E1E2E] text-[#C8C0B0]/40 text-[11px] font-black flex items-center justify-center">
                          {film.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-[#F5F0E8] text-sm truncate">{film.title}</p>
                          <p className="text-[12px] text-[#C8C0B0]/50">{film.director}</p>
                          {film.country && <p className="text-[11px] text-[#C8C0B0]/30">{film.country}</p>}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {film.average_rating !== null
                            ? <p className="font-bold text-[#C9A84C] text-base">{film.average_rating.toFixed(1)}<span className="text-[10px] text-[#C8C0B0]/30">/10</span></p>
                            : <p className="text-[12px] text-[#C8C0B0]/20">—</p>}
                          <p className="text-[11px] text-[#C8C0B0]/30">{film.rating_count} votes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
