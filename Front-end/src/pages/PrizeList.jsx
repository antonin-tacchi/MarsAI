import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ── YouTube thumbnail ── */
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
  const yt = youtubeThumb(film?.youtube_url);
  if (path) return /^https?:\/\//i.test(path) ? path : `${API_URL}${path}`;
  if (yt) return yt;
  return "/placeholder.jpg";
}

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

/* ── Medal config ── */
const MEDAL = {
  1: { label: "GRAND PRIX",  color: "#C9A84C", bg: "rgba(201,168,76,0.07)",  border: "#C9A84C", glow: "rgba(201,168,76,0.15)" },
  2: { label: "2ème PRIX",   color: "#A8A9AD", bg: "rgba(168,169,173,0.05)", border: "#A8A9AD", glow: "rgba(168,169,173,0.10)" },
  3: { label: "3ème PRIX",   color: "#C47A3A", bg: "rgba(196,122,58,0.05)",  border: "#C47A3A", glow: "rgba(196,122,58,0.10)" },
};

/* ── Score bar ── */
function ScoreBar({ value, color }) {
  if (value === null) return null;
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-px rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color || "#C9A84C" }}
        />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color: color || "#C9A84C" }}>
        {pct}%
      </span>
    </div>
  );
}

/* ── Top 3 row (featured) ── */
function FeaturedRow({ film, index }) {
  const m = MEDAL[film.rank];
  return (
    <div
      className="group relative flex items-center gap-5 px-6 py-5 rounded-xl border overflow-hidden transition-all duration-300 hover:scale-[1.005]"
      style={{
        background: m.bg,
        borderColor: m.border + "40",
        boxShadow: `0 0 40px ${m.glow}, inset 0 1px 0 ${m.border}18`,
        animation: `fadeUp .5s ease ${index * 0.1}s both`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: `linear-gradient(to bottom, ${m.border}, ${m.border}40)` }}
      />

      {/* Rank */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 w-10 text-center ml-2">
        <span
          className="font-black text-3xl leading-none tabular-nums"
          style={{ color: m.color + "50" }}
        >
          {film.rank}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-14 flex-shrink-0" style={{ background: `${m.border}20` }} />

      {/* Thumbnail */}
      <div
        className="flex-shrink-0 rounded-lg overflow-hidden border"
        style={{ width: 80, height: 52, borderColor: m.border + "30" }}
      >
        <Thumb film={film} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Award badge */}
        <span
          className="inline-block px-2 py-0.5 text-[9px] font-black tracking-[0.35em] uppercase rounded mb-1.5"
          style={{ background: m.color + "20", color: m.color }}
        >
          {m.label}
        </span>
        <p
          className="font-bold text-base leading-tight truncate transition-colors"
          style={{ color: "#F5F0E8" }}
        >
          {film.title}
        </p>
        <p className="text-[12px] mt-0.5 truncate" style={{ color: "#C8C0B0" + "60" }}>
          {film.director}
          {film.country ? <span className="opacity-50"> · {film.country}</span> : null}
        </p>
        {film.average_rating !== null && (
          <ScoreBar value={film.average_rating} color={m.color} />
        )}
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right min-w-[64px]">
        {film.average_rating !== null ? (
          <>
            <p className="font-black text-2xl tabular-nums leading-none" style={{ color: m.color }}>
              {film.average_rating.toFixed(1)}
            </p>
            <p className="text-[10px]" style={{ color: m.color + "50" }}>/10</p>
            {film.rating_count > 0 && (
              <p className="text-[10px] mt-1" style={{ color: "#C8C0B0" + "25" }}>
                {film.rating_count} votes
              </p>
            )}
          </>
        ) : (
          <span style={{ color: "#C8C0B0" + "15" }}>—</span>
        )}
      </div>
    </div>
  );
}

/* ── Standard rank row ── */
function RankRow({ film, index }) {
  const isTop10 = film.rank <= 10;
  return (
    <div
      className="group flex items-center gap-4 px-5 py-3.5 border-b hover:bg-white/[0.02] transition-colors cursor-default"
      style={{
        borderColor: "#C9A84C0A",
        animation: `fadeUp .3s ease ${index * 0.025}s both`,
      }}
    >
      {/* Rank */}
      <span
        className="w-8 text-right flex-shrink-0 font-black tabular-nums leading-none"
        style={{
          fontSize: isTop10 ? 18 : 14,
          color: isTop10 ? "#C9A84C30" : "#C8C0B015",
        }}
      >
        {film.rank}
      </span>

      {/* Divider */}
      <div className="w-px h-7 flex-shrink-0" style={{ background: "#C9A84C0D" }} />

      {/* Thumbnail */}
      <div className="w-12 h-8 rounded overflow-hidden flex-shrink-0 bg-white/5 border border-white/5">
        <Thumb film={film} className="w-full h-full object-cover" />
      </div>

      {/* Title + director */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate transition-colors group-hover:text-[#C9A84C]"
          style={{ color: "#E8E0D5" }}>
          {film.title}
        </p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: "#C8C0B040" }}>
          {film.director}
        </p>
      </div>

      {/* Country */}
      {film.country && (
        <span
          className="hidden md:inline text-[11px] px-2 py-0.5 rounded flex-shrink-0 border"
          style={{ color: "#C8C0B040", borderColor: "#C9A84C15" }}
        >
          {film.country}
        </span>
      )}

      {/* Score + bar */}
      <div className="flex-shrink-0 min-w-[100px] text-right">
        {film.average_rating !== null ? (
          <div>
            <span className="font-black text-sm tabular-nums" style={{ color: "#C9A84C" }}>
              {film.average_rating.toFixed(1)}
              <span className="font-normal text-[10px]" style={{ color: "#C8C0B025" }}>/10</span>
            </span>
            <div className="mt-1 h-[2px] rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.round((film.average_rating / 10) * 100)}%`,
                  background: "linear-gradient(to right, #C9A84C80, #C9A84C)",
                }}
              />
            </div>
          </div>
        ) : (
          <span style={{ color: "#C8C0B015" }}>—</span>
        )}
      </div>
    </div>
  );
}

/* ── Section divider ── */
function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <span className="text-[9px] font-bold tracking-[0.5em] uppercase" style={{ color: "#C9A84C" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #C9A84C30, transparent)" }} />
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

  const top3 = ranking.filter(f => f.rank <= 3);
  const rest = ranking.filter(f => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
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

      <div className="min-h-screen" style={{ background: "#0A0A0F" }}>

        {/* ── Header ── */}
        <div
          className="relative border-b overflow-hidden"
          style={{ borderColor: "#C9A84C12" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)",
            }}
          />
          <div
            className="relative max-w-4xl mx-auto px-6 py-14 md:py-20 text-center"
            style={{ animation: "fadeUp .4s ease both" }}
          >
            <p
              className="text-[9px] font-bold tracking-[0.65em] uppercase mb-4"
              style={{ color: "#C9A84C80" }}
            >
              {t("prizeList.festivalLabel")}
            </p>
            <h1 className="gold-text font-display font-black text-6xl md:text-8xl tracking-tight leading-none">
              {t("prizeList.title")}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-7">
              <div className="h-px w-20" style={{ background: "linear-gradient(to right, transparent, #C9A84C35)" }} />
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#C9A84C60">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div className="h-px w-20" style={{ background: "linear-gradient(to left, transparent, #C9A84C35)" }} />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-28 gap-4">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{ borderColor: "#C9A84C20", borderTopColor: "#C9A84C" }}
              />
              <p className="text-[11px] tracking-[0.45em] uppercase" style={{ color: "#C8C0B030" }}>
                {t("prizeList.loading")}
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              className="py-16 text-center rounded-xl border p-10"
              style={{ borderColor: "#8B1A2E30", background: "#8B1A2E08" }}
            >
              <p className="font-bold tracking-widest uppercase text-sm" style={{ color: "#E8607A" }}>
                {t("prizeList.error")}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && ranking.length === 0 && (
            <div
              className="py-24 text-center rounded-xl border"
              style={{ borderColor: "#C9A84C12" }}
            >
              <p className="font-display text-xl font-bold uppercase tracking-widest" style={{ color: "#C8C0B020" }}>
                {t("prizeList.noResults")}
              </p>
              <p className="text-[13px] mt-3" style={{ color: "#C8C0B012" }}>
                {t("prizeList.noResultsDesc")}
              </p>
            </div>
          )}

          {/* ── Lauréats (top 3) ── */}
          {!loading && !error && top3.length > 0 && (
            <section className="mb-12">
              <SectionLabel label="Lauréats" />
              <div className="space-y-3">
                {top3.map((film, i) => (
                  <FeaturedRow key={film.film_id} film={film} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* ── Classement complet ── */}
          {!loading && !error && rest.length > 0 && (
            <section>
              <SectionLabel label={t("prizeList.rankingLabel")} />

              {/* Table header */}
              <div
                className="hidden md:flex items-center gap-4 px-5 pb-2 mb-1 text-[10px] font-bold tracking-[0.35em] uppercase"
                style={{ color: "#C8C0B025" }}
              >
                <span className="w-8 text-right flex-shrink-0">#</span>
                <span className="w-px h-4 flex-shrink-0" />
                <span className="w-12 flex-shrink-0" />
                <span className="flex-1">{t("prizeList.film")}</span>
                <span className="w-16 text-center">{t("prizeList.country")}</span>
                <span className="min-w-[100px] text-right">{t("prizeList.averageRating")}</span>
              </div>

              <div
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "#C9A84C12" }}
              >
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
