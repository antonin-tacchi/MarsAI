import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/* ─────────────────── helpers ─────────────────── */
function youtubeThumb(url) {
  if (!url) return "";
  try {
    if (url.includes("youtu.be/")) return `https://img.youtube.com/vi/${url.split("youtu.be/")[1].split(/[?&#]/)[0]}/hqdefault.jpg`;
    if (url.includes("watch?v="))  return `https://img.youtube.com/vi/${new URL(url).searchParams.get("v")}/hqdefault.jpg`;
    if (url.includes("/embed/"))   return `https://img.youtube.com/vi/${url.split("/embed/")[1].split(/[?&#]/)[0]}/hqdefault.jpg`;
  } catch { /* ignore */ }
  return "";
}
function resolveImg(film) {
  const p = film?.thumbnail_stream_url || film?.thumbnail_url || "";
  const y = youtubeThumb(film?.youtube_url);
  if (p) return /^https?:\/\//i.test(p) ? p : `${API_URL}${p}`;
  return y || "/placeholder.jpg";
}
function Thumb({ film, className }) {
  const [src, setSrc] = useState(() => resolveImg(film));
  return <img src={src} alt={film.title} className={className} onError={() => setSrc("/placeholder.jpg")} />;
}

/* ─────────────────── barre animée ─────────────────── */
function Bar({ value, color, delay = 0, height = 3 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.round((value / 10) * 100)), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: "rgba(255,255,255,0.05)" }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}60, ${color})`,
          transition: "width 1.1s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

/* ─────────────────── médailles ─────────────────── */
const M = {
  1: { badge: "GRAND PRIX",  c: "#D4A843", bg: "rgba(212,168,67,.14)", border: "rgba(212,168,67,.30)", text: "#0A0A0F" },
  2: { badge: "2ÈME PRIX",   c: "#B4B6BE", bg: "rgba(180,182,190,.08)", border: "rgba(180,182,190,.22)", text: "#0A0A0F" },
  3: { badge: "3ÈME PRIX",   c: "#C47A3A", bg: "rgba(196,122,58,.10)", border: "rgba(196,122,58,.25)", text: "#F5F0E8" },
};

/* ─────────────────── GRAND PRIX hero ─────────────────── */
function GrandPrix({ film }) {
  const m = M[1];
  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ height: 420, animation: "up .7s ease both" }}>
      {/* image */}
      <Thumb film={film} className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scale(1.04)" }} />

      {/* overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top,  #070710 0%, rgba(7,7,16,.72) 45%, rgba(7,7,16,.18) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(7,7,16,.75) 0%, transparent 55%)" }} />

      {/* numéro filigrane */}
      <div
        className="absolute right-0 top-0 select-none pointer-events-none font-black leading-none"
        style={{ fontSize: 320, color: "rgba(212,168,67,.04)", lineHeight: .85, letterSpacing: "-.04em", right: -20, top: -20 }}
      >
        1
      </div>

      {/* contenu */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
        {/* badge + ligne */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="px-3 py-1 rounded text-[10px] font-black tracking-[.4em]"
            style={{ background: m.c, color: m.text }}
          >
            {m.badge}
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${m.c}50, transparent)` }} />
          {film.rating_count > 0 && (
            <span className="text-[11px]" style={{ color: "rgba(200,192,176,.35)" }}>{film.rating_count} votes</span>
          )}
        </div>

        {/* titre */}
        <h2
          className="font-black text-white leading-none"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", textShadow: "0 2px 24px rgba(0,0,0,.7)" }}
        >
          {film.title}
        </h2>
        <p className="mt-2 text-[14px]" style={{ color: "rgba(200,192,176,.6)" }}>
          {film.director}{film.country ? ` · ${film.country}` : ""}
        </p>

        {/* score + barre */}
        <div className="mt-5 flex items-end gap-6">
          <div className="flex-1 max-w-sm">
            <Bar value={film.average_rating} color={m.c} delay={600} height={4} />
            <p className="mt-1.5 text-[11px]" style={{ color: `${m.c}60` }}>
              {Math.round((film.average_rating / 10) * 100)} %
            </p>
          </div>
          <div className="flex-shrink-0 text-right leading-none">
            <span className="font-black tabular-nums" style={{ fontSize: 56, color: m.c, lineHeight: 1 }}>
              {film.average_rating?.toFixed(1)}
            </span>
            <span className="font-normal" style={{ fontSize: 18, color: `${m.c}55` }}>/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── 2e et 3e cartes ─────────────────── */
function RunnerCard({ film, delay }) {
  const m = M[film.rank];
  return (
    <div
      className="relative flex-1 overflow-hidden rounded-xl"
      style={{ minHeight: 260, animation: `up .65s ease ${delay}s both` }}
    >
      <Thumb film={film} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #070710 0%, rgba(7,7,16,.68) 50%, rgba(7,7,16,.1) 100%)" }} />

      {/* numéro filigrane */}
      <div
        className="absolute top-0 right-2 font-black leading-none select-none pointer-events-none"
        style={{ fontSize: 140, color: `${m.c}07`, lineHeight: .85 }}
      >
        {film.rank}
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <span
          className="self-start px-2 py-0.5 rounded text-[9px] font-black tracking-[.35em] mb-2"
          style={{ background: `${m.c}28`, color: m.c }}
        >
          {m.badge}
        </span>
        <p className="font-bold text-white text-[15px] leading-snug" style={{ textShadow: "0 1px 12px rgba(0,0,0,.8)" }}>
          {film.title}
        </p>
        <p className="mt-0.5 text-[12px] truncate" style={{ color: "rgba(200,192,176,.55)" }}>
          {film.director}{film.country ? ` · ${film.country}` : ""}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <Bar value={film.average_rating} color={m.c} delay={700 + (film.rank - 2) * 120} height={3} />
          </div>
          <span className="font-black tabular-nums text-lg flex-shrink-0" style={{ color: m.c }}>
            {film.average_rating?.toFixed(1)}
            <span className="font-normal text-[11px]" style={{ color: `${m.c}50` }}>/10</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── ligne du tableau ─────────────────── */
function Row({ film, i }) {
  const isHigh = film.rank <= 10;
  return (
    <div
      className="group flex items-center gap-4 px-5 py-[14px] border-b hover:bg-white/[.022] transition-colors cursor-default"
      style={{ borderColor: "rgba(201,168,76,.06)", animation: `up .28s ease ${i * .022}s both` }}
    >
      {/* rang */}
      <span
        className="w-7 text-right flex-shrink-0 font-black tabular-nums leading-none"
        style={{ fontSize: isHigh ? 19 : 14, color: isHigh ? "rgba(201,168,76,.3)" : "rgba(200,192,176,.12)" }}
      >
        {film.rank}
      </span>

      {/* sep */}
      <div className="w-px h-8 flex-shrink-0" style={{ background: "rgba(201,168,76,.08)" }} />

      {/* thumb */}
      <div className="flex-shrink-0 rounded-md overflow-hidden border" style={{ width: 60, height: 38, borderColor: "rgba(255,255,255,.06)" }}>
        <Thumb film={film} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>

      {/* titre + réal + barre */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13px] truncate group-hover:text-[#C9A84C] transition-colors duration-200" style={{ color: "#EDE6DC" }}>
          {film.title}
        </p>
        <p className="text-[11px] truncate mt-0.5" style={{ color: "rgba(200,192,176,.35)" }}>
          {film.director}
        </p>
        {film.average_rating !== null && (
          <div className="mt-1.5 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.04)", maxWidth: 160 }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(film.average_rating / 10) * 100}%`, background: "linear-gradient(to right, rgba(201,168,76,.4), #C9A84C)" }}
            />
          </div>
        )}
      </div>

      {/* pays */}
      {film.country ? (
        <span
          className="hidden md:inline flex-shrink-0 text-[11px] px-2 py-0.5 rounded border"
          style={{ color: "rgba(200,192,176,.38)", borderColor: "rgba(201,168,76,.1)" }}
        >
          {film.country}
        </span>
      ) : <span className="hidden md:inline w-14" />}

      {/* note */}
      <div className="flex-shrink-0 min-w-[52px] text-right">
        {film.average_rating !== null ? (
          <span className="font-black text-[13px] tabular-nums" style={{ color: "#C9A84C" }}>
            {film.average_rating.toFixed(1)}
            <span className="font-normal text-[10px]" style={{ color: "rgba(200,192,176,.22)" }}>/10</span>
          </span>
        ) : (
          <span style={{ color: "rgba(200,192,176,.12)" }}>—</span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────── séparateur de section ─────────────────── */
function Sep({ label }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,.2))" }} />
      <span className="text-[9px] font-black tracking-[.55em] uppercase" style={{ color: "rgba(201,168,76,.55)" }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,.2))" }} />
    </div>
  );
}

/* ─────────────────── PAGE ─────────────────── */
export default function PrizeList() {
  const { t } = useLanguage();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const res  = await fetch(`${API_URL}/api/films/ranking`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Error");
        setRanking(json.data || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const gold   = ranking.find(f => f.rank === 1);
  const silver = ranking.find(f => f.rank === 2);
  const bronze = ranking.find(f => f.rank === 3);
  const rest   = ranking.filter(f => f.rank > 3);

  return (
    <>
      <style>{`
        @keyframes up {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmer {
          0%,100% { background-position: 0% center; }
          50%      { background-position: 200% center; }
        }
        .gold-title {
          background: linear-gradient(90deg, #8B6914, #E8C55A, #C9A84C, #FFD700, #C9A84C, #8B6914);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 6s ease-in-out infinite;
        }
        .grain::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: .025;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>

      <div className="relative min-h-screen grain" style={{ background: "#07070D" }}>

        {/* ══ HEADER ══ */}
        <div
          className="relative border-b text-center overflow-hidden"
          style={{ borderColor: "rgba(201,168,76,.1)", paddingTop: "clamp(4rem,10vw,7rem)", paddingBottom: "clamp(3rem,7vw,5rem)" }}
        >
          {/* halo */}
          <div
            className="absolute inset-x-0 top-0 h-[340px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse 70% 100% at 50% 0%, rgba(201,168,76,.08), transparent)" }}
          />

          {/* étoiles décoratives */}
          <div className="flex items-center justify-center gap-3 mb-5" style={{ animation: "up .4s ease both" }}>
            <span style={{ color: "rgba(201,168,76,.25)", fontSize: 7 }}>✦✦✦</span>
            <span className="text-[9px] font-bold tracking-[.65em] uppercase" style={{ color: "rgba(201,168,76,.55)" }}>
              {t("prizeList.festivalLabel")}
            </span>
            <span style={{ color: "rgba(201,168,76,.25)", fontSize: 7 }}>✦✦✦</span>
          </div>

          <h1
            className="gold-title font-black leading-none px-4"
            style={{ fontSize: "clamp(3.5rem, 12vw, 9rem)", letterSpacing: "-.02em", animation: "up .5s ease .05s both" }}
          >
            {t("prizeList.title")}
          </h1>

          <p
            className="mt-5 text-[13px] tracking-[.25em] uppercase"
            style={{ color: "rgba(200,192,176,.35)", animation: "up .5s ease .1s both" }}
          >
            Classement officiel du jury
          </p>

          {/* ligne déco */}
          <div className="flex items-center justify-center gap-5 mt-7" style={{ animation: "up .5s ease .15s both" }}>
            <div className="h-px w-24" style={{ background: "linear-gradient(to right, transparent, rgba(201,168,76,.3))" }} />
            <svg width="12" height="12" viewBox="0 0 12 12" fill="rgba(201,168,76,.45)">
              <polygon points="6,0 7.4,4.4 12,4.4 8.3,7.2 9.7,11.6 6,8.8 2.3,11.6 3.7,7.2 0,4.4 4.6,4.4"/>
            </svg>
            <div className="h-px w-24" style={{ background: "linear-gradient(to left, transparent, rgba(201,168,76,.3))" }} />
          </div>
        </div>

        {/* ══ CONTENU ══ */}
        <div className="max-w-4xl mx-auto px-4 py-14 md:py-20 space-y-14">

          {/* loading */}
          {loading && (
            <div className="flex flex-col items-center py-32 gap-5">
              <div
                className="w-8 h-8 rounded-full border-2 animate-spin"
                style={{ borderColor: "rgba(201,168,76,.15)", borderTopColor: "#C9A84C" }}
              />
              <p className="text-[11px] tracking-[.5em] uppercase" style={{ color: "rgba(200,192,176,.25)" }}>
                {t("prizeList.loading")}
              </p>
            </div>
          )}

          {/* erreur */}
          {!loading && error && (
            <div className="py-20 text-center rounded-2xl border p-12" style={{ borderColor: "rgba(139,26,46,.25)", background: "rgba(139,26,46,.07)" }}>
              <p className="text-[13px] font-black tracking-widest uppercase" style={{ color: "#E8607A" }}>
                {t("prizeList.error")}
              </p>
            </div>
          )}

          {/* vide */}
          {!loading && !error && ranking.length === 0 && (
            <div className="py-32 text-center rounded-2xl border" style={{ borderColor: "rgba(201,168,76,.08)" }}>
              <p className="font-black text-xl uppercase tracking-widest" style={{ color: "rgba(200,192,176,.15)" }}>
                {t("prizeList.noResults")}
              </p>
              <p className="mt-3 text-[13px]" style={{ color: "rgba(200,192,176,.08)" }}>
                {t("prizeList.noResultsDesc")}
              </p>
            </div>
          )}

          {/* ══ LAURÉATS ══ */}
          {!loading && !error && (gold || silver || bronze) && (
            <section>
              <Sep label="Lauréats" />

              {/* Grand Prix */}
              {gold && <div className="mb-4"><GrandPrix film={gold} /></div>}

              {/* 2e et 3e */}
              {(silver || bronze) && (
                <div className="flex gap-4">
                  {silver && <RunnerCard film={silver} delay={.12} />}
                  {bronze && <RunnerCard film={bronze} delay={.22} />}
                </div>
              )}
            </section>
          )}

          {/* ══ CLASSEMENT COMPLET ══ */}
          {!loading && !error && rest.length > 0 && (
            <section>
              <Sep label={t("prizeList.rankingLabel")} />

              {/* en-tête colonnes */}
              <div
                className="hidden md:grid px-5 pb-2 mb-1 text-[9px] font-black tracking-[.4em] uppercase"
                style={{ gridTemplateColumns: "28px 1px 60px 1fr auto auto", gap: "1rem", color: "rgba(200,192,176,.2)" }}
              >
                <span className="text-right">#</span>
                <span />
                <span />
                <span>{t("prizeList.film")}</span>
                <span className="hidden md:inline">{t("prizeList.country")}</span>
                <span className="text-right">{t("prizeList.averageRating")}</span>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(201,168,76,.09)" }}>
                {rest.map((film, i) => <Row key={film.film_id} film={film} i={i} />)}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
