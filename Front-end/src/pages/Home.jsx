import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import imgHero from "../images/Hero.jpg";
import imgCountdown from "../images/homepage.png";
import "../styles/Home.css";

import FilmCard from "../components/FilmCard.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Fallback si API indisponible (évite un compte à rebours mort-né)
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
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const STATS = [
  { value: "3000", label: "Visiteurs minimum à attendre lors du Festival" },
  { value: "+120", label: "Pays représentés en sélection" },
  {
    value: "+60",
    label:
      "professionnels de l'IA générative et personnalités mobilisés lors du festival",
  },
  { value: "+600", label: "Films soumis à la sélection" },
];

export default function Home() {
  const [festivalDate, setFestivalDate] = useState(FALLBACK_FESTIVAL_DATE);
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(FALLBACK_FESTIVAL_DATE));
  const [featuredFilms, setFeaturedFilms] = useState([]);

  // ✅ Fetch festival_config (event_date) from backend
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/festival-config/active`);
        const json = await res.json();

        if (!res.ok || !json?.success) throw new Error(json?.message || "Error");

        const raw = json?.data?.event_date;
        const d = raw ? new Date(raw) : null;

        if (!d || Number.isNaN(d.getTime())) {
          throw new Error("Invalid event_date format");
        }

        if (alive) setFestivalDate(d);
      } catch (err) {
        console.error("Festival config fetch error:", err);
        // On garde le fallback sans casser la page
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Countdown interval based on festivalDate
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(festivalDate));
    }, 1000);

    return () => clearInterval(id);
  }, [festivalDate]);

  // ✅ Randomize 3 films on each page load
  useEffect(() => {
    fetch(`${API_URL}/api/films?all=1`)
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
    <div className="bg-[#FBF5F0] min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-40 md:py-56"
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim
            ad minim veniam.
          </p>
        </div>
      </section>

      {/* ═══════ GALERIE ═══════ */}
      <section className="background-galery py-16 px-6">
        <div className="max-w-6xl mx-auto">
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
                    className="w-[260px] aspect-video rounded-lg bg-[#262335]/10 animate-pulse"
                  />
                ))}
          </div>

          <div className="text-center">
            <Link
              to="/catalogs"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#262335] text-white font-bold rounded-full hover:bg-[#463699] transition-colors"
            >
              Découvrir →
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
                { value: pad(timeLeft.days), label: "JOURS" },
                { value: pad(timeLeft.hours), label: "HEURES" },
                { value: pad(timeLeft.minutes), label: "MINUTES" },
                { value: pad(timeLeft.seconds), label: "SECONDES" },
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
              JE PARTICIPE
            </Link>
            <a
              href="#"
              className="px-10 py-3 border-2 border-white text-white font-black rounded-full uppercase tracking-wider hover:bg-white/10 transition-colors text-sm"
            >
              NOUS SUIVRE
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="background-stats py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black text-[#262335] leading-tight mb-4">
              Le festival
              <br />
              en chiffre
            </h2>
            <p className="text-[#262335]/60 text-base leading-relaxed max-w-sm">
              Des chiffres qui reflètent l'ampleur et l'impact du Festival Mars
              AI sur la scène internationale du cinéma et de la créativité.
            </p>
          </div>

          <div className="md:w-1/2 grid grid-cols-2 gap-10">
            {STATS.map(({ value, label }, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-black text-[#463699] mb-2">
                  {value}
                </div>
                <p className="text-sm text-[#262335]/70 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}