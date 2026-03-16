import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ── Resolve thumbnail src (same logic as FilmCard) ── */
function youtubeThumb(url) {
  if (!url) return "";
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
    if (url.includes("/embed/")) {
      const id = url.split("/embed/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
  } catch { /* ignore */ }
  return "";
}

function resolveImg(film) {
  const path = film?.thumbnail_stream_url || film?.thumbnail_url || "";
  const yt   = youtubeThumb(film?.youtube_url);
  let src = "";
  if (path) {
    src = /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`;
  } else if (yt) {
    src = yt;
  }
  return src || "/placeholder.jpg";
}

/* ── Thumbnail image with fallback ── */
function Thumb({ film, className }) {
  const [src, setSrc] = useState(() => resolveImg(film));
  return (
    <img
      src={src}
      alt={film.title}
      className={className}
      onError={() => setSrc("/placeholder.jpg")}
    />
  );
}

const AWARD = {
  1: { label: "GRAND PRIX",  accent: "#C9A84C", text: "#0A0A0F" },
  2: { label: "2ème PRIX",   accent: "#A8A9AD", text: "#0A0A0F" },
  3: { label: "3ème PRIX",   accent: "#C47A3A", text: "#F5F0E8" },
};

/* ── Score pill ── */
function Score({ value, large }) {
  if (value === null) return null;
  return (
    <div className={`flex items-baseline gap-1 tabular-nums ${large ? "text-4xl" : "text-2xl"}`}>
      <span className="font-black text-[#C9A84C]">{value.toFixed(1)}</span>
      <span className="text-[#C8C0B0]/35 font-normal" style={{ fontSize: large ? 14 : 11 }}>/10</span>
    </div>
  );
}

/* ── Winner hero card (rank 1) ── */
function HeroWinner({ film, t }) {
  const aw = AWARD[1];
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[#C9A84C]/40 shadow-[0_0_80px_rgba(201,168,76,0.2)]"
      style={{ animation: "fadeUp .6s ease both" }}
    >
      {/* Background image */}
      <div className="relative h-72 md:h-96">
        <Thumb film={film} className="w-full h-full object-cover" />
        {/* Dark gradient from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />

        {/* Award badge */}
        <div
          className="absolute top-5 left-5 px-3 py-1.5 text-[10px] font-black tracking-[0.35em] uppercase rounded"
          style={{ background: aw.accent, color: aw.text }}
        >
          {aw.label}
        </div>
      </div>

      {/* Info panel */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-10">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-display font-black text-white text-3xl md:text-4xl leading-tight truncate">
              {film.title}
            </p>
            <p className="text-[#C8C0B0]/60 text-sm mt-1.5 truncate">
              {film.director}{film.country ? ` · ${film.country}` : ""}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <Score value={film.average_rating} large />
            {film.rating_count > 0 && (
              <p className="text-[#C8C0B0]/25 text-[10px] mt-1">{film.rating_count} votes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Side winner card (rank 2 & 3) ── */
function SideWinner({ film, delay }) {
  const aw = AWARD[film.rank];
  if (!aw) return null;
  return (
    <div
      className="relative rounded-lg overflow-hidden border flex-1"
      style={{
        borderColor: aw.accent + "55",
        animation: `fadeUp .6s ease ${delay}s both`,
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 md:h-52 overflow-hidden">
        <Thumb film={film} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />

        {/* Award badge */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-black tracking-[0.3em] uppercase rounded"
          style={{ background: aw.accent, color: aw.text }}
        >
          {aw.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-[#0D0D14]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-[#F5F0E8] text-sm leading-snug truncate">{film.title}</p>
            <p className="text-[#C8C0B0]/45 text-[12px] mt-0.5 truncate">{film.director}</p>
            {film.country && (
              <p className="text-[#C8C0B0]/25 text-[11px] mt-0.5">{film.country}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Score value={film.average_rating} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ranking list row ── */
function RankRow({ film, index }) {
  const isTop10 = film.rank <= 10;
  return (
    <div
      className="group flex items-center gap-5 px-5 py-4 border-b border-[#C9A84C]/8 hover:bg-[#C9A84C]/5 transition-colors"
      style={{ animation: `fadeUp .35s ease ${index * 0.03}s both` }}
    >
      {/* Rank number */}
      <span className={`w-10 text-right flex-shrink-0 font-black tabular-nums leading-none
        ${isTop10 ? "text-2xl text-[#C9A84C]/30" : "text-lg text-[#C8C0B0]/15"}`}>
        {film.rank}
      </span>

      {/* Thin divider */}
      <div className="w-px h-8 bg-[#C9A84C]/10 flex-shrink-0" />

      {/* Thumbnail */}
      <div className="w-14 h-9 rounded overflow-hidden flex-shrink-0 border border-[#C9A84C]/10 bg-[#1E1E2E]">
        <Thumb film={film} className="w-full h-full object-cover" />
      </div>

      {/* Title + director */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#E8E0D5] text-sm truncate group-hover:text-[#C9A84C] transition-colors">
          {film.title}
        </p>
        <p className="text-[12px] text-[#C8C0B0]/35 truncate mt-0.5">{film.director}</p>
      </div>

      {/* Country */}
      {film.country && (
        <span className="hidden md:inline text-[11px] border border-[#C9A84C]/12 text-[#C8C0B0]/40 px-2 py-0.5 rounded flex-shrink-0">
          {film.country}
        </span>
      )}

      {/* Score */}
      <div className="text-right flex-shrink-0 min-w-[56px]">
        {film.average_rating !== null ? (
          <>
            <p className="font-black text-[#C9A84C] text-base tabular-nums leading-none">
              {film.average_rating.toFixed(1)}
              <span className="text-[10px] font-normal text-[#C8C0B0]/25">/10</span>
            </p>
            {film.rating_count > 0 && (
              <p className="text-[10px] text-[#C8C0B0]/20 mt-0.5">{film.rating_count} votes</p>
            )}
          </>
        ) : (
          <span className="text-[#C8C0B0]/15">—</span>
        )}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function PrizeList() {
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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

  const winner   = ranking.find(f => f.rank === 1);
  const runners  = ranking.filter(f => f.rank === 2 || f.rank === 3);
  const rest     = ranking.filter(f => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .gold-text {
          background: linear-gradient(90deg, #B8962E 0%, #FFD700 35%, #C9A84C 55%, #B8962E 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
      `}</style>

      <div className="bg-[#0A0A0F] min-h-screen">

        {/* ── Header ── */}
        <div className="relative overflow-hidden border-b border-[#C9A84C]/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,168,76,0.07),transparent_65%)] pointer-events-none" />
          <div
            className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 text-center"
            style={{ animation: "fadeUp .5s ease both" }}
          >
            <p className="text-[9px] font-bold tracking-[0.6em] uppercase text-[#C9A84C]/60 mb-5">
              {t("prizeList.festivalLabel")}
            </p>
            <h1 className="gold-text font-display font-black text-6xl md:text-8xl tracking-tight leading-none">
              {t("prizeList.title")}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-8">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-[#C9A84C]/35" />
              <svg className="w-4 h-4 text-[#C9A84C]/40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-[#C9A84C]/35" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-28 gap-4">
              <div className="w-7 h-7 border-2 border-[#C9A84C]/20 border-t-[#C9A84C] rounded-full animate-spin" />
              <p className="text-[11px] text-[#C8C0B0]/30 tracking-[0.4em] uppercase">{t("prizeList.loading")}</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="py-20 text-center border border-[#8B1A2E]/25 rounded-lg bg-[#8B1A2E]/8 p-10">
              <p className="text-[#E8607A] font-bold tracking-widest uppercase text-sm">{t("prizeList.error")}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && ranking.length === 0 && (
            <div className="py-28 text-center border border-[#C9A84C]/10 rounded-xl">
              <p className="font-display text-xl font-bold text-[#C8C0B0]/20 uppercase tracking-widest">{t("prizeList.noResults")}</p>
              <p className="text-[13px] text-[#C8C0B0]/12 mt-3">{t("prizeList.noResultsDesc")}</p>
            </div>
          )}

          {/* ── Winners ── */}
          {!loading && !error && (winner || runners.length > 0) && (
            <section className="mb-16 space-y-4">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[9px] font-bold tracking-[0.45em] uppercase text-[#C9A84C]">Lauréats</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/25 to-transparent" />
              </div>

              {winner && <HeroWinner film={winner} t={t} />}

              {runners.length > 0 && (
                <div className="flex gap-4">
                  {runners.map((film, i) => (
                    <SideWinner key={film.film_id} film={film} delay={0.15 + i * 0.1} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Full ranking ── */}
          {!loading && !error && rest.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-[9px] font-bold tracking-[0.45em] uppercase text-[#C9A84C]">{t("prizeList.rankingLabel")}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#C9A84C]/25 to-transparent" />
              </div>

              <div className="rounded-xl border border-[#C9A84C]/10 overflow-hidden">
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
