import { Link } from "react-router-dom";
import image1 from "/src/images/imgregister.png";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  const sections = [
    { titleKey: "about.section1Title", textKey: "about.section1Text", dark: false },
    { titleKey: "about.section2Title", textKey: "about.section2Text", dark: false },
    { titleKey: "about.section3Title", textKey: "about.section3Text", dark: true },
    { titleKey: "about.section4Title", textKey: "about.section4Text", dark: true },
    { titleKey: "about.section5Title", textKey: "about.section5Text", dark: false },
    { titleKey: "about.section6Title", textKey: "about.section6Text", dark: false },
    { titleKey: "about.section7Title", textKey: "about.section7Text", dark: true },
    { titleKey: "about.section8Title", textKey: "about.section8Text", dark: true },
  ];

  return (
    <div className="bg-[#FBF5F0]">
      {/* HERO */}
      <section className="bg-[#262335]">
        <div className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
              {t("about.heroTitle")}
            </h1>

            <p className="text-white/80 text-lg leading-relaxed max-w-xl">
              {t("about.heroSubtitle")}
            </p>
          </div>

          <div className="rounded-[28px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <img
              src={image1}
              alt="MarsAI Festival"
              className="w-full h-[460px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-y border-[#eee]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div>
            <p className="text-4xl font-bold text-[#463699]">3000</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              {t("about.visitorsLabel")}
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+60</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              {t("about.professionalsLabel")}
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+120</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              {t("about.screenedLabel")}
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+600</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              {t("about.submittedLabel")}
            </p>
          </div>
        </div>
      </section>

      {/* 8 SECTIONS */}
      {sections.map((s, i) => (
        <section key={i} className={s.dark ? "bg-[#262335]" : "bg-[#FBF5F0]"}>
          <div className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16">
            <h3
              className={`text-2xl font-semibold ${
                s.dark ? "text-white" : "text-[#262335]"
              }`}
            >
              {t(s.titleKey)}
            </h3>

            <p
              className={`text-lg leading-relaxed ${
                s.dark ? "text-white/70" : "text-[#262335]/70"
              }`}
            >
              {t(s.textKey)}
            </p>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[#FBF5F0]">
        <div className="max-w-5xl mx-auto px-6 py-24 flex flex-wrap gap-5 justify-center">
          <Link
            to="/submissions"
            className="bg-[#262335] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
          >
            {t("about.submitFilm")}
          </Link>

          <button className="border border-[#262335] text-[#262335] px-8 py-4 rounded-xl font-semibold hover:bg-[#262335] hover:text-white transition">
            {t("about.newsletter")}
          </button>

          <Link
            to="/regulation"
            className="border border-[#262335] text-[#262335] px-8 py-4 rounded-xl font-semibold hover:bg-[#262335] hover:text-white transition"
          >
            {t("about.regulation")}
          </Link>
        </div>
      </section>
    </div>
  );
}
