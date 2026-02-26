import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import imgHero from "../images/imglogin.jpg";
import imgCountdown from "../images/fondsoumissionfilm.jpg";
import { useLanguage } from "../context/LanguageContext";

const FESTIVAL_DATE = new Date("2026-09-15T00:00:00");
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

function youtubeThumb(url) {
  if (!url) return null;
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
    if (url.includes("/embed/")) {
      const id = url.split("/embed/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    }
  } catch { /* ignore */ }
  return null;
}

function getFilmThumbnail(film) {
  return (
    film?.thumbnail_stream_url ||
    film?.thumbnail_url ||
    film?.poster_stream_url ||
    film?.poster_url ||
    youtubeThumb(film?.youtube_url) ||
    null
  );
}

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const STAT_VALUES = ["3000", "+120", "+60", "+600"];

export default function Home() {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(FESTIVAL_DATE));
  const [featuredFilms, setFeaturedFilms] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(FESTIVAL_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/films?all=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setFeaturedFilms(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="bg-[#FBF5F0] min-h-screen">

      {/* ═══════ HERO ═══════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-40 md:py-56"
        style={{
          backgroundImage: `url(${imgHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#262335]/65" />
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight italic">
            Festival MarsAi
          </h1>
          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl mx-auto">
            {t("home.heroDescription")}
          </p>
        </div>
      </section>

      {/* ═══════ GALERIE ═══════ */}
      <section className="bg-[#FBF5F0] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {featuredFilms.length > 0
              ? featuredFilms.map((film) => {
                  const thumb = getFilmThumbnail(film);
                  return (
                    <Link
                      key={film.id}
                      to={`/details-film/${film.id}`}
                      className="group aspect-video overflow-hidden rounded-lg bg-[#262335]/10 relative block"
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={film.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#262335]/10">
                          <span className="text-[#262335]/30 text-4xl">🎬</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end p-4">
                        <p className="text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow">
                          {film.title}
                        </p>
                      </div>
                    </Link>
                  );
                })
              : [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-[#262335]/10 animate-pulse"
                  />
                ))}
          </div>
          <div className="text-center">
            <Link
              to="/catalogs"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#262335] text-white font-bold rounded-full hover:bg-[#463699] transition-colors"
            >
              {t("home.discoverBtn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ COUNTDOWN ═══════ */}
      <section
        className="relative py-28 px-6 text-center overflow-hidden"
        style={{
          backgroundImage: `url(${imgCountdown})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#262335]/85" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/5 font-black text-[10rem] md:text-[16rem] leading-none tracking-widest uppercase whitespace-nowrap">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Timer */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-8 mb-10 inline-block w-full">
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-white">
              {[
                { value: pad(timeLeft.days), label: t("home.countdownDays") },
                { value: pad(timeLeft.hours), label: t("home.countdownHours") },
                { value: pad(timeLeft.minutes), label: t("home.countdownMinutes") },
                { value: pad(timeLeft.seconds), label: t("home.countdownSeconds") },
              ].map(({ value, label }, i) => (
                <div key={i} className="flex items-center gap-4 md:gap-6">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black tabular-nums">
                      {value}
                    </div>
                    <div className="text-xs font-bold tracking-widest mt-1 text-white/70">
                      {label}
                    </div>
                  </div>
                  {i < 3 && (
                    <span className="text-2xl font-bold text-white/30">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/submissions"
              className="px-10 py-3 bg-white text-[#262335] font-black rounded-full uppercase tracking-wider hover:bg-[#FBF5F0] transition-colors text-sm"
            >
              {t("home.participateBtn")}
            </Link>
            <a
              href="#"
              className="px-10 py-3 border-2 border-white text-white font-black rounded-full uppercase tracking-wider hover:bg-white/10 transition-colors text-sm"
            >
              {t("home.followBtn")}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="bg-[#FBF5F0] py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          {/* Titre gauche */}
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black text-[#262335] leading-tight mb-4">
              {t("home.statsTitle").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="text-[#262335]/60 text-base leading-relaxed max-w-sm">
              {t("home.statsDescription")}
            </p>
          </div>

          {/* Grille stats droite */}
          <div className="md:w-1/2 grid grid-cols-2 gap-10">
            {STAT_VALUES.map((value, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-black text-[#463699] mb-2">
                  {value}
                </div>
                <p className="text-sm text-[#262335]/70 leading-snug">
                  {t(`home.stat${i + 1}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
