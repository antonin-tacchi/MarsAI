import { Link } from "react-router-dom";
import image1 from "/src/images/imgregister.png";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const stats = [
    { value: t("about.stat1Value"), label: t("about.stat1Label") },
    { value: t("about.stat2Value"), label: t("about.stat2Label") },
    { value: t("about.stat3Value"), label: t("about.stat3Label") },
    { value: t("about.stat4Value"), label: t("about.stat4Label") },
  ];

  const sections = [
    { title: t("about.section01Title"), text: t("about.section01Text") },
    { title: t("about.section02Title"), text: t("about.section02Text") },
    { title: t("about.section03Title"), text: t("about.section03Text") },
    { title: t("about.section04Title"), text: t("about.section04Text") },
    { title: t("about.section05Title"), text: t("about.section05Text") },
    { title: t("about.section06Title"), text: t("about.section06Text") },
    { title: t("about.section07Title"), text: t("about.section07Text") },
    { title: t("about.section08Title"), text: t("about.section08Text") },
  ];

  return (
    <div className="bg-[#0A0A0F] min-h-screen">

      {/* ── HERO ── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-40"
        style={{
          backgroundImage: `url(${image1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/65 via-[#0A0A0F]/50 to-[#0A0A0F]" />

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.03] font-display font-black text-[14rem] md:text-[20rem] leading-none tracking-widest uppercase whitespace-nowrap">
            MARSAI
          </span>
        </div>

        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="w-8 h-px bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-[10px] font-bold tracking-[0.4em] uppercase">
              {t("about.festivalBadge")}
            </span>
            <div className="w-8 h-px bg-[#C9A84C]" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-black text-[#F5F0E8] leading-[0.95] mb-6">
            {t("about.heroTitle")}<br />
            <span className="text-gold-gradient">{t("about.heroTitleAccent")}</span>
          </h1>

          <p className="text-[#C8C0B0] text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            {t("about.heroDescription")}
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="background-stats py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          <div className="md:w-1/2">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-4">— En Chiffres —</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#F5F0E8] leading-tight mb-4">
              {t("about.statsTitle").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <div className="w-12 h-px bg-gradient-to-r from-[#C9A84C] to-transparent mb-4" />
            <p className="text-[#C8C0B0] text-base leading-relaxed max-w-sm">
              {t("about.statsDescription")}
            </p>
          </div>

          <div className="md:w-1/2 grid grid-cols-2 gap-10">
            {stats.map(({ value, label }) => (
              <div key={label} className="pl-4 border-l border-[#C9A84C]/25">
                <div className="text-4xl md:text-5xl font-black text-gold-gradient font-display mb-2 tabular-nums">
                  {value}
                </div>
                <p className="text-sm text-[#C8C0B0] leading-snug tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTIONS ── */}
      <section className="px-6 py-20 bg-[#0A0A0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">— À Propos —</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8]">
              {t("about.sectionTitle")}
            </h2>
            <div className="mt-4 w-14 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {sections.map((s, i) => (
              <div
                key={i}
                className="cinema-card p-8 group"
              >
                <h3 className="font-display text-lg font-bold text-[#F5F0E8] mb-3 group-hover:text-[#C9A84C] transition-colors duration-200">
                  {s.title}
                </h3>
                <p className="text-[#C8C0B0] text-sm leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANIFESTE ── */}
      <section className="relative py-28 px-6 text-center overflow-hidden bg-[#12121A]">
        {/* Gold top/bottom accents */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.025] font-display font-black text-[10rem] md:text-[16rem] leading-none tracking-widest uppercase whitespace-nowrap">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="border border-[#C9A84C]/20 bg-[#0A0A0F]/60 backdrop-blur-sm rounded-lg px-8 py-12 shadow-[0_0_40px_rgba(201,168,76,0.06)]">
            <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#C9A84C] mb-6">
              {t("about.manifesteLabel")}
            </p>
            <blockquote className="font-display text-2xl md:text-4xl font-bold text-white leading-tight italic mb-6">
              {t("about.manifesteQuote")}
            </blockquote>
            <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mb-6" />
            <p className="text-[#E8E0D0] text-sm leading-relaxed max-w-xl mx-auto">
              {t("about.manifesteText")}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#12121A]">
        {/* Gold top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mb-16" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">— Rejoignez-nous —</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8]">
              {t("about.ctaTitle").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <div className="mt-4 w-14 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Main CTA */}
            <Link
              to="/submissions"
              className="md:col-span-2 group relative rounded border border-[#C9A84C]/30 bg-[#1E1E2E] p-10 flex flex-col justify-between min-h-[200px] hover:border-[#C9A84C]/70 hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-5 right-7 text-[#C9A84C]/20 font-black text-8xl leading-none select-none pointer-events-none">
                →
              </div>
              <div>
                <p className="text-[#C9A84C] text-[10px] font-bold tracking-[0.25em] uppercase mb-3">
                  {t("about.ctaParticipateLabel")}
                </p>
                <h3 className="font-display text-2xl font-bold text-white">
                  {t("about.submitFilm")}
                </h3>
              </div>
              <span className="mt-6 inline-flex">
                <span className="px-8 py-3 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] font-bold rounded text-[11px] tracking-[0.2em] uppercase group-hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] transition-all duration-300">
                  {t("about.submitFilmBtn")}
                </span>
              </span>
            </Link>

            {/* Secondary CTAs */}
            <div className="flex flex-col gap-5">
              <button className="flex-1 group rounded border border-[#C9A84C]/30 bg-[#1E1E2E] p-7 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:bg-[#262336] transition-all duration-300 text-left">
                <h3 className="font-display text-base font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                  {t("about.newsletter")}
                </h3>
                <span className="mt-4 inline-flex">
                  <span className="px-5 py-2 border border-[#C9A84C]/50 group-hover:border-[#C9A84C] text-[#C9A84C] font-bold rounded text-[11px] tracking-[0.15em] uppercase transition-colors">
                    {t("about.newsletterBtn")}
                  </span>
                </span>
              </button>

              <Link
                to="/regulation"
                className="flex-1 group rounded border border-[#C9A84C]/30 bg-[#1E1E2E] p-7 flex flex-col justify-between hover:border-[#C9A84C]/60 hover:bg-[#262336] transition-all duration-300"
              >
                <h3 className="font-display text-base font-bold text-white group-hover:text-[#C9A84C] transition-colors">
                  {t("about.regulation")}
                </h3>
                <span className="mt-4 inline-flex">
                  <span className="px-5 py-2 border border-[#C9A84C]/50 group-hover:border-[#C9A84C] text-[#C9A84C] font-bold rounded text-[11px] tracking-[0.15em] uppercase transition-colors">
                    {t("about.regulationBtn")}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
