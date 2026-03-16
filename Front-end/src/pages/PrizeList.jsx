import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ── Helpers ── */
const RANK_CONFIG = {
  1: {
    crown: "M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.8 7.1 17.2l.9-5.5L4 7.8l5.5-.8L12 2z",
    borderColor: "border-[#C9A84C]",
    glowColor:   "shadow-[0_0_60px_rgba(201,168,76,0.35),0_0_120px_rgba(201,168,76,0.15)]",
    badgeBg:     "bg-gradient-to-br from-[#C9A84C] via-[#FFD700] to-[#B8962E]",
    badgeText:   "text-[#0A0A0F]",
    accentText:  "text-[#FFD700]",
    label:       "medalGold",
    heightClass: "h-56 md:h-72",
    stepH:       "h-16",
    order:       1,
  },
  2: {
    crown: "M12 3l1.8 3.6 4 .6-2.9 2.8.7 4L12 12l-3.6 1.9.7-4L6.2 7.2l4-.6L12 3z",
    borderColor: "border-[#A8A9AD]/50",
    glowColor:   "shadow-[0_0_30px_rgba(168,169,173,0.2)]",
    badgeBg:     "bg-gradient-to-br from-[#8A8A8A] to-[#D4D5D8]",
    badgeText:   "text-[#0A0A0F]",
    accentText:  "text-[#D4D5D8]",
    label:       "medalSilver",
    heightClass: "h-44 md:h-56",
    stepH:       "h-10",
    order:       0,
  },
  3: {
    crown: "M12 3l1.8 3.6 4 .6-2.9 2.8.7 4L12 12l-3.6 1.9.7-4L6.2 7.2l4-.6L12 3z",
    borderColor: "border-[#C47A3A]/40",
    glowColor:   "shadow-[0_0_30px_rgba(196,122,58,0.2)]",
    badgeBg:     "bg-gradient-to-br from-[#7C4B2E] to-[#C47A3A]",
    badgeText:   "text-[#F5F0E8]",
    accentText:  "text-[#C47A3A]",
    label:       "medalBronze",
    heightClass: "h-36 md:h-44",
    stepH:       "h-6",
    order:       2,
  },
};

function ScoreArc({ value, max = 10, rank }) {
  const cfg = RANK_CONFIG[rank] || RANK_CONFIG[3];
  return (
    <div className="flex flex-col items-center">
      <span className={`font-black tabular-nums text-2xl leading-none ${cfg.accentText}`}>
        {value.toFixed(1)}
      </span>
      <span className="text-[10px] text-[#C8C0B0]/40 tracking-widest">/10</span>
    </div>
  );
}

/* ── Podium ── */
function PodiumCard({ film, t }) {
  const cfg = RANK_CONFIG[film.rank] || RANK_CONFIG[3];
  const isFirst = film.rank === 1;

  return (
    <div
      className="flex flex-col"
      style={{ animation: `fadeUp 0.6s ease ${(film.rank - 1) * 0.1}s both`, order: cfg.order }}
    >
      {/* Film card */}
      <div className={`relative rounded-t overflow-hidden border ${cfg.borderColor} ${isFirst ? cfg.glowColor : ""} flex flex-col`}>
        {/* Thumbnail */}
        <div className={`relative overflow-hidden ${cfg.heightClass} flex-shrink-0`}>
          {film.thumbnail_url ? (
            <img
              src={`${API_URL}${film.thumbnail_url}`}
              alt={film.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.classList.add("bg-[#1E1E2E]"); e.target.remove(); }}
            />
          ) : (
            <div className="w-full h-full bg-[#1E1E2E] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#C9A84C]/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
              </svg>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />

          {/* Rank badge top-left */}
          <div className={`absolute top-2 left-2 w-9 h-9 rounded flex items-center justify-center font-black text-sm ${cfg.badgeBg} ${cfg.badgeText} shadow-lg`}>
            {film.rank}
          </div>

          {/* Score bottom-right */}
          {film.average_rating !== null && (
            <div className="absolute bottom-3 right-3">
              <ScoreArc value={film.average_rating} rank={film.rank} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className={`p-3 bg-[#0D0D14] border-t ${cfg.borderColor}/30`}>
          <p className="font-bold text-[#F5F0E8] text-[13px] leading-tight truncate">{film.title}</p>
          <p className="text-[11px] text-[#C8C0B0]/50 truncate mt-0.5">{film.director}</p>
          {film.rating_count > 0 && (
            <p className="text-[10px] text-[#C8C0B0]/25 mt-1">{film.rating_count} votes</p>
          )}
        </div>
      </div>

      {/* Podium step */}
      <div className={`${cfg.stepH} ${cfg.badgeBg} flex items-center justify-center rounded-b`}>
        <span className={`text-[9px] font-black tracking-[0.3em] uppercase ${cfg.badgeText}`}>
          {t(`prizeList.${cfg.label}`)}
        </span>
      </div>
    </div>
  );
}

/* ── Ranking row ── */
function RankRow({ film, index }) {
  const cfg = RANK_CONFIG[film.rank];

  return (
    <div
      className="group relative flex items-center gap-4 px-5 py-4 border-b border-[#C9A84C]/8 hover:bg-[#C9A84C]/5 transition-colors"
      style={{ animation: `fadeUp 0.4s ease ${index * 0.035}s both` }}
    >
      {/* Rank number */}
      <div className="w-10 flex-shrink-0 text-center">
        {cfg ? (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded font-black text-xs ${cfg.badgeBg} ${cfg.badgeText}`}>
            {film.rank}
          </span>
        ) : (
          <span className="text-[#C8C0B0]/25 font-black text-lg tabular-nums">{film.rank}</span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 border border-[#C9A84C]/10 bg-[#1E1E2E]">
        {film.thumbnail_url ? (
          <img src={`${API_URL}${film.thumbnail_url}`} alt={film.title} className="w-full h-full object-cover"
            onError={(e) => { e.target.remove(); }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-4 h-4 text-[#C9A84C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h18M3 16h18" />
            </svg>
          </div>
        )}
      </div>

      {/* Title + director */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#F5F0E8] text-sm truncate group-hover:text-[#C9A84C] transition-colors">
          {film.title}
        </p>
        <p className="text-[12px] text-[#C8C0B0]/45 truncate mt-0.5">{film.director}</p>
      </div>

      {/* Country */}
      {film.country && (
        <span className="hidden md:inline text-[11px] border border-[#C9A84C]/15 text-[#C8C0B0]/50 px-2 py-0.5 rounded flex-shrink-0">
          {film.country}
        </span>
      )}

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        {film.average_rating !== null ? (
          <>
            <p className="font-black text-[#C9A84C] text-base tabular-nums leading-none">
              {film.average_rating.toFixed(1)}
              <span className="text-[10px] font-normal text-[#C8C0B0]/30">/10</span>
            </p>
            <p className="text-[10px] text-[#C8C0B0]/25 mt-0.5">{film.rating_count} votes</p>
          </>
        ) : (
          <span className="text-[#C8C0B0]/20 text-sm">—</span>
        )}
      </div>
    </div>
  );
}

/* ── Section title ── */
function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C9A84C]">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/30 to-transparent" />
    </div>
  );
}

/* ── Page ── */
export default function PrizeList() {
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

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

  const top3 = ranking
    .filter(f => f.rank <= 3)
    .sort((a, b) => {
      const vis = { 2: 0, 1: 1, 3: 2 };
      return (vis[a.rank] ?? 9) - (vis[b.rank] ?? 9);
    });
  const rest = ranking.filter(f => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #C9A84C 0%, #FFD700 40%, #C9A84C 60%, #B8962E 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
      `}</style>

      <div className="bg-[#0A0A0F] min-h-screen">

        {/* ── Hero header ── */}
        <div className="relative border-b border-[#C9A84C]/10 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24"
               style={{ animation: "fadeUp 0.6s ease both" }}>
            {/* Trophy icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center shadow-[0_0_40px_rgba(201,168,76,0.2)]">
                <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                </svg>
              </div>
            </div>

            <p className="text-center text-[10px] font-bold tracking-[0.5em] uppercase text-[#C9A84C]/70 mb-3">
              {t("prizeList.festivalLabel")}
            </p>
            <h1 className="shimmer-text text-center font-display font-black text-5xl md:text-7xl tracking-tight leading-none mb-4">
              {t("prizeList.title")}
            </h1>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A84C]/40" />
              <div className="w-1 h-1 rounded-full bg-[#C9A84C]/50" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A84C]/40" />
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-5xl mx-auto px-4 py-14 md:py-20">

          {/* Loading */}
          {loading && (
            <div className="text-center py-24">
              <div className="inline-block w-8 h-8 border-2 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin mb-4" />
              <p className="text-[11px] text-[#C8C0B0]/35 tracking-[0.4em] uppercase">{t("prizeList.loading")}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20 border border-[#8B1A2E]/30 rounded-lg bg-[#8B1A2E]/8 p-10">
              <p className="font-bold text-[#E8607A] uppercase tracking-widest text-sm">{t("prizeList.error")}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && ranking.length === 0 && (
            <div className="text-center py-28 border border-[#C9A84C]/10 rounded-lg">
              <div className="w-16 h-16 rounded-full border border-[#C9A84C]/15 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-[#C9A84C]/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="font-display text-lg font-bold text-[#C8C0B0]/25 uppercase tracking-widest">{t("prizeList.noResults")}</p>
              <p className="text-[13px] text-[#C8C0B0]/15 mt-2">{t("prizeList.noResultsDesc")}</p>
            </div>
          )}

          {/* ── Podium ── */}
          {!loading && !error && top3.length > 0 && (
            <section className="mb-20">
              <SectionTitle>— {t("prizeList.podiumLabel")}</SectionTitle>

              <div className="grid grid-cols-3 gap-3 md:gap-5 items-end max-w-2xl mx-auto">
                {top3.map((film) => (
                  <PodiumCard key={film.film_id} film={film} t={t} />
                ))}
              </div>
            </section>
          )}

          {/* ── Full ranking ── */}
          {!loading && !error && rest.length > 0 && (
            <section>
              <SectionTitle>— {t("prizeList.rankingLabel")}</SectionTitle>

              <div className="border border-[#C9A84C]/12 rounded-lg overflow-hidden bg-[#0A0A0F]">
                {/* Header */}
                <div className="hidden md:grid grid-cols-[3rem_4rem_1fr_auto_7rem] gap-4 items-center px-5 py-3 bg-[#12121A] border-b border-[#C9A84C]/15">
                  <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] text-center">#</span>
                  <span />
                  <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A84C]">{t("prizeList.film")}</span>
                  <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A84C]">{t("prizeList.country")}</span>
                  <span className="text-[9px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] text-right">{t("prizeList.averageRating")}</span>
                </div>

                {rest.map((film, i) => (
                  <RankRow key={film.film_id} film={film} index={i} />
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
