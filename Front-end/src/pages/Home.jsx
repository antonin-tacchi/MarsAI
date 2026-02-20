import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Home() {
  const { lang, t } = useLanguage();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/pages/home`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || "Error");
        setContent(json.data);
      } catch (err) {
        console.error("Home fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#262335]">{t("common.loading")}</p>
      </div>
    );
  }

  // Fallback static content if API fails or no data
  const fallback = {
    hero: { title: "MarsAI Festival", subtitle: "", backgroundImage: "" },
    about: { title: "", text: "" },
    dates: { title: "", items: [] },
    cta: { title: "", text: "", buttonText: "", buttonLink: "/submissions" },
  };

  const page = lang === "en" ? content?.content_en : content?.content_fr;
  const data = page
    ? typeof page === "string"
      ? JSON.parse(page)
      : page
    : fallback;

  const hero = data.hero || fallback.hero;
  const about = data.about || fallback.about;
  const dates = data.dates || fallback.dates;
  const cta = data.cta || fallback.cta;

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      {/* ═══════ HERO ═══════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-24 md:py-36"
        style={{
          backgroundColor: "#262335",
          backgroundImage: hero.backgroundImage
            ? `url(${hero.backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {hero.backgroundImage && (
          <div className="absolute inset-0 bg-[#262335]/70" />
        )}
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
            {hero.title}
          </h1>
          {hero.subtitle && (
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              {hero.subtitle}
            </p>
          )}
        </div>
      </section>

      {/* ═══════ ABOUT ═══════ */}
      {(about.title || about.text) && (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
          {about.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-[#262335] mb-6 text-center">
              {about.title}
            </h2>
          )}
          {about.text && (
            <p className="text-lg text-[#262335]/70 leading-relaxed text-center max-w-2xl mx-auto">
              {about.text}
            </p>
          )}
        </section>
      )}

      {/* ═══════ DATES ═══════ */}
      {dates.title && Array.isArray(dates.items) && dates.items.length > 0 && (
        <section className="bg-[#262335] py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
              {dates.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dates.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10"
                >
                  <p className="text-sm font-bold text-[#463699] uppercase tracking-wider mb-2">
                    {item.label}
                  </p>
                  <p className="text-xl font-semibold text-white">
                    {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA ═══════ */}
      {(cta.title || cta.text) && (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          {cta.title && (
            <h2 className="text-3xl md:text-4xl font-bold text-[#262335] mb-4">
              {cta.title}
            </h2>
          )}
          {cta.text && (
            <p className="text-lg text-[#262335]/70 mb-8 max-w-2xl mx-auto">
              {cta.text}
            </p>
          )}
          {cta.buttonText && (
            <Link
              to={cta.buttonLink || "/submissions"}
              className="inline-block px-8 py-3 bg-[#463699] text-white font-bold rounded-xl
                         hover:bg-[#362a7a] transition-colors text-lg"
            >
              {cta.buttonText}
            </Link>
          )}
        </section>
      )}

      {/* Error hint (small, non-blocking) */}
      {error && !content && (
        <div className="text-center py-8">
          <p className="text-[#262335]/40 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
