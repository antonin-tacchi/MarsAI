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
    { id: "01", title: t("about.section01Title"), text: t("about.section01Text") },
    { id: "02", title: t("about.section02Title"), text: t("about.section02Text") },
    { id: "03", title: t("about.section03Title"), text: t("about.section03Text") },
    { id: "04", title: t("about.section04Title"), text: t("about.section04Text") },
    { id: "05", title: t("about.section05Title"), text: t("about.section05Text") },
    { id: "06", title: t("about.section06Title"), text: t("about.section06Text") },
    { id: "07", title: t("about.section07Title"), text: t("about.section07Text") },
    { id: "08", title: t("about.section08Title"), text: t("about.section08Text") },
  ];

  return (
    <div className="bg-[#FBF5F0] min-h-screen">

      {/* HERO */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 py-40"
        style={{
          backgroundImage: `url(${image1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[#262335]/70" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.04] font-black text-[14rem] md:text-[18rem] leading-none tracking-widest uppercase whitespace-nowrap italic">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="w-6 h-px bg-[#463699]" />
            <span className="text-[#463699] text-xs font-bold tracking-[0.25em] uppercase">
              {t("about.festivalBadge")}
            </span>
            <span className="w-6 h-px bg-[#463699]" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter italic leading-none mb-8">
            {t("about.heroTitle")}<br />
            <span className="text-[#463699]">{t("about.heroTitleAccent")}</span>
          </h1>

          <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl mx-auto">
            {t("about.heroDescription")}
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="background-stats py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12 md:gap-20 items-start">
          <div className="md:w-1/2">
            <h2 className="text-4xl md:text-5xl font-black text-[#262335] leading-tight mb-4 uppercase tracking-tighter italic">
              {t("about.statsTitle").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="text-[#262335]/60 text-base leading-relaxed max-w-sm">
              {t("about.statsDescription")}
            </p>
          </div>

          <div className="md:w-1/2 grid grid-cols-2 gap-10">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl md:text-5xl font-black text-[#463699] mb-2 tabular-nums">
                  {value}
                </div>
                <p className="text-sm text-[#262335]/70 leading-snug tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-[#262335] uppercase tracking-tighter italic mb-12 p-6">
            {t("about.sectionTitle")}
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {sections.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.15)] backdrop-blur hover:shadow-[0_18px_60px_-30px_rgba(70,54,153,0.15)] hover:border-[#463699]/20 transition-all duration-300 group"
              >
                <span className="text-[#463699] text-xs font-bold tracking-[0.25em] uppercase block mb-4">
                  {s.id}
                </span>
                <h3 className="text-xl font-black text-[#262335] mb-3 uppercase tracking-tight group-hover:text-[#463699] transition-colors">
                  {s.title}
                </h3>
                <p className="text-[#262335]/60 text-sm leading-relaxed">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="relative py-28 px-6 text-center overflow-hidden bg-[#262335]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.04] font-black text-[10rem] md:text-[16rem] leading-none tracking-widest uppercase whitespace-nowrap italic">
            MARSAI
          </span>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-12">
            <p className="text-[#463699] text-xs font-bold tracking-[0.25em] uppercase mb-6">
              {t("about.manifesteLabel")}
            </p>
            <blockquote className="text-2xl md:text-4xl font-black text-white leading-tight italic mb-6 uppercase tracking-tight">
              {t("about.manifesteQuote")}
            </blockquote>
            <p className="text-white/50 text-sm leading-relaxed max-w-xl mx-auto">
              {t("about.manifesteText")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="background-stats py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-[#262335] uppercase tracking-tighter italic mb-12 p-6">
            {t("about.ctaTitle").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>

          <div className="grid md:grid-cols-3 gap-5 px-6">
            <Link
              to="/submissions"
              className="md:col-span-2 group relative rounded-2xl bg-[#262335] p-10 flex flex-col justify-between min-h-[200px] hover:bg-[#463699] transition-colors duration-300 overflow-hidden"
            >
              <div className="absolute top-6 right-8 text-white/10 font-black text-8xl leading-none select-none italic pointer-events-none">
                →
              </div>
              <div>
                <p className="text-white/40 text-xs font-bold tracking-[0.2em] uppercase mb-3">
                  {t("about.ctaParticipateLabel")}
                </p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {t("about.submitFilm")}
                </h3>
              </div>
              <span className="mt-6 inline-flex">
                <span className="px-8 py-3 bg-white text-[#262335] font-black rounded-full uppercase tracking-wider text-xs group-hover:bg-[#FBF5F0] transition-colors">
                  {t("about.submitFilmBtn")}
                </span>
              </span>
            </Link>

            <div className="flex flex-col gap-5">
              <button className="flex-1 group rounded-2xl border-2 border-[#262335] p-7 flex flex-col justify-between hover:bg-[#262335] transition-colors duration-300 text-left">
                <h3 className="text-base font-black text-[#262335] group-hover:text-white transition-colors uppercase tracking-tight">
                  {t("about.newsletter")}
                </h3>
                <span className="mt-4 inline-flex">
                  <span className="px-5 py-2 border border-[#262335] group-hover:border-white text-[#262335] group-hover:text-white font-black rounded-full uppercase tracking-wider text-xs transition-colors">
                    {t("about.newsletterBtn")}
                  </span>
                </span>
              </button>

              <Link
                to="/regulation"
                className="flex-1 group rounded-2xl border-2 border-[#262335] p-7 flex flex-col justify-between hover:bg-[#262335] transition-colors duration-300"
              >
                <h3 className="text-base font-black text-[#262335] group-hover:text-white transition-colors uppercase tracking-tight">
                  {t("about.regulation")}
                </h3>
                <span className="mt-4 inline-flex">
                  <span className="px-5 py-2 border border-[#262335] group-hover:border-white text-[#262335] group-hover:text-white font-black rounded-full uppercase tracking-wider text-xs transition-colors">
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