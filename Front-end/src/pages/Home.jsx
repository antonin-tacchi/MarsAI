import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import imgHero from "../images/Hero.jpg";
import imgCountdown from "../images/homepage.png";
import "../styles/Home.css";
import { useLanguage } from "../context/LanguageContext";

import FilmCard from "../components/FilmCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const FALLBACK_FESTIVAL_DATE = new Date("2026-06-15T18:00:00");

function pickRandom(items, count) {
  const arr = Array.isArray(items) ? [...items] : [];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

function getTimeLeft(targetDate) {
  if (!targetDate || Number.isNaN(targetDate.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = targetDate.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const STAT_VALUES = ["3000", "+120", "+60", "+600"];

export default function Home() {
  const { t } = useLanguage();
  const [festivalDate, setFestivalDate] = useState(FALLBACK_FESTIVAL_DATE);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(FALLBACK_FESTIVAL_DATE));
  const [featuredFilms, setFeaturedFilms] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/festival-config/active`);
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message || "Error");
        const raw = json?.data?.event_date;
        const d   = raw ? new Date(raw) : null;
        if (!d || Number.isNaN(d.getTime())) throw new Error("Invalid event_date format");
        if (alive) setFestivalDate(d);
      } catch (err) {
        console.error("Festival config fetch error:", err);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(festivalDate)), 1000);
    return () => clearInterval(id);
  }, [festivalDate]);

  useEffect(() => {
    fetch(`${API_URL}/api/films?all=1&status=selected`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setFeaturedFilms(pickRandom(data.data, 3));
        } else {
          setFeaturedFilms([]);
        }
      })
      .catch(() => setFeaturedFilms([]));
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-[#0A0A0F] min-h-screen">

      {/* ═══════════════════════════════════════════
          HERO — Cinematic full-screen opening
      ═══════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-40 md:py-56 overflow-hidden"
        style={{
          backgroundImage: `url(${imgHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/70 via-[#0A0A0F]/50 to-[#0A0A0F]" />

        {/* Vignette */}
        <div className="absolute inset-0 hero-vignette" />

        {/* Gold top film strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        {/* Large watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.03] font-display font-black text-[14rem] md:text-[22rem] leading-none tracking-[0.15em] uppercase whitespace-nowrap">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-4xl">
          {/* Pre-title label */}
          <p className="text-[11px] font-semibold tracking-[0.5em] uppercase text-[#C9A84C] mb-6 animate-fade-in-up">
            Festival International du Film
          </p>

          {/* Main title */}
          <h1 className="font-display text-6xl md:text-8xl font-black text-[#F5F0E8] mb-4 leading-[0.95] animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}>
            Festival
            <span className="block text-gold-gradient mt-1">MarsAI</span>
          </h1>

          {/* Gold divider */}
          <div className="flex items-center justify-center gap-4 my-7" style={{ animationDelay: "0.2s" }}>
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#C9A84C]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#C9A84C]" />
          </div>

          {/* Tagline */}
          <p className="text-[#C8C0B0] text-lg md:text-xl leading-relaxed max-w-xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}>
            {t("home.heroDescription")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: "0.35s" }}>
            <Link
              to="/submissions"
              className="px-10 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] font-bold text-[13px] tracking-[0.2em] uppercase rounded hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] hover:scale-[1.02] transition-all duration-300"
            >
              {t("home.participateBtn")}
            </Link>
            <Link
              to="/catalogs"
              className="px-10 py-3.5 border border-[#C9A84C]/50 text-[#C9A84C] font-bold text-[13px] tracking-[0.2em] uppercase rounded hover:border-[#C9A84C] hover:bg-[#C9A84C]/8 transition-all duration-300"
            >
              {t("home.discoverBtn")}
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#C9A84C]/60 animate-bounce">
          <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">Découvrir</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FILMS EN SÉLECTION
      ═══════════════════════════════════════════ */}
      <section className="background-galery py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">
              — Sélection Officielle —
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8]">
              Films en Compétition
            </h2>
            <div className="mt-4 w-14 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
          </div>

          {/* Film cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 place-items-center">
            {featuredFilms.length > 0
              ? featuredFilms.map((film) => (
                  <FilmCard
                    key={film.id}
                    film={film}
                    apiUrl={API_URL}
                    imageVariant="auto"
                  />
                ))
              : [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-[280px] aspect-video rounded border border-[#C9A84C]/10 bg-[#12121A] animate-pulse"
                  />
                ))}
          </div>

          <div className="text-center">
            <Link
              to="/catalogs"
              className="inline-flex items-center gap-3 px-9 py-3 border border-[#C9A84C]/40 text-[#C9A84C] text-[12px] font-semibold tracking-[0.25em] uppercase rounded hover:border-[#C9A84C] hover:bg-[#C9A84C]/8 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300"
            >
              <span>{t("home.discoverBtn")}</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMPTE À REBOURS — Cinematic countdown
      ═══════════════════════════════════════════ */}
      <section
        className="relative py-28 px-6 text-center overflow-hidden"
        style={{
          backgroundImage: `url(${imgCountdown})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#0A0A0F]/88" />

        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.025] font-display font-black text-[12rem] md:text-[18rem] leading-none tracking-widest uppercase whitespace-nowrap">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.45em] uppercase text-[#C9A84C] mb-3">
            — Cérémonie de Remise des Prix —
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-[#F5F0E8] mb-10">
            Le Festival Approche
          </h2>

          {/* Countdown box */}
          <div className="inline-block w-full max-w-2xl mb-10">
            <div className="bg-[#12121A]/80 backdrop-blur-md border border-[#C9A84C]/20 rounded-lg px-8 py-8 shadow-[0_0_40px_rgba(0,0,0,0.6),0_0_20px_rgba(201,168,76,0.08)]">
              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 text-[#F5F0E8]">
                {[
                  { value: pad(timeLeft.days),    label: t("home.countdownDays") },
                  { value: pad(timeLeft.hours),   label: t("home.countdownHours") },
                  { value: pad(timeLeft.minutes), label: t("home.countdownMinutes") },
                  { value: pad(timeLeft.seconds), label: t("home.countdownSeconds") },
                ].map(({ value, label }, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-4">
                    <div className="text-center px-3 md:px-5">
                      <div className="text-5xl md:text-6xl font-black tabular-nums countdown-digit text-gold-gradient">
                        {value}
                      </div>
                      <div className="text-[9px] font-bold tracking-[0.4em] mt-2 text-[#C8C0B0]/70 uppercase">
                        {label}
                      </div>
                    </div>
                    {i < 3 && (
                      <span className="text-2xl font-thin text-[#C9A84C]/30 pb-5">:</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/submissions"
              className="px-10 py-3.5 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] font-bold text-[12px] tracking-[0.2em] uppercase rounded hover:shadow-[0_0_28px_rgba(201,168,76,0.5)] hover:scale-[1.02] transition-all duration-300"
            >
              {t("home.participateBtn")}
            </Link>
            <a
              href="#"
              className="px-10 py-3.5 border border-[#F5F0E8]/25 text-[#F5F0E8] font-bold text-[12px] tracking-[0.2em] uppercase rounded hover:border-[#F5F0E8]/50 hover:bg-[#F5F0E8]/5 transition-all duration-300"
            >
              {t("home.followBtn")}
            </a>
          </div>
        </div>

        {/* Gold bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          STATISTIQUES — Prestigious numbers
      ═══════════════════════════════════════════ */}
      <section className="background-stats py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-14 md:gap-20 items-start">
            {/* Left: text */}
            <div className="md:w-1/2">
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-4">
                — En Chiffres —
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#F5F0E8] leading-tight mb-5">
                {t("home.statsTitle").split("\n").map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </h2>
              <div className="w-12 h-px bg-gradient-to-r from-[#C9A84C] to-transparent mb-5" />
              <p className="text-[#C8C0B0] text-base leading-relaxed max-w-sm">
                {t("home.statsDescription")}
              </p>
            </div>

            {/* Right: stats grid */}
            <div className="md:w-1/2 grid grid-cols-2 gap-x-10 gap-y-10">
              {STAT_VALUES.map((value, i) => (
                <div key={i} className="relative pl-4 border-l border-[#C9A84C]/25">
                  <div className="text-4xl md:text-5xl font-black text-gold-gradient mb-2 font-display">
                    {value}
                  </div>
                  <p className="text-[13px] text-[#C8C0B0] leading-snug tracking-wide">
                    {t(`home.stat${i + 1}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
