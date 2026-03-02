import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <main className="bg-[#f6f1ea]">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-[#1f1f2b]">
          {t("privacy.title")}
        </h1>

        <div className="mt-10 bg-white/60 rounded-2xl p-8 md:p-10 border border-black/5">
          <p className="text-[#2b2b3a] leading-relaxed">{t("privacy.intro")}</p>

          <div className="mt-10 space-y-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("privacy.s1.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("privacy.s1.p")}
              </p>
              <ul className="mt-4 space-y-2 text-[#2b2b3a]">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 inline-block w-2 h-2 rounded-full bg-[#1f1f2b]" />
                    <span className="leading-relaxed">
                      {t(`privacy.s1.li${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("privacy.s2.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("privacy.s2.p")}
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("privacy.s3.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("privacy.s3.p")}
              </p>
              <ul className="mt-4 space-y-2 text-[#2b2b3a]">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 inline-block w-2 h-2 rounded-full bg-[#1f1f2b]" />
                    <span className="leading-relaxed">
                      {t(`privacy.s3.li${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("privacy.s4.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("privacy.s4.p")}
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("privacy.s5.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("privacy.s5.p")}
              </p>
            </div>
          </div>

          <div className="mt-10 text-sm text-[#2b2b3a]/80">{t("privacy.note")}</div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/contact"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-[#1f1f2b] text-white hover:opacity-95 transition"
          >
            {t("privacy.cta.contact")}
          </Link>

          <Link
            to="/cookies"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-white text-[#1f1f2b] hover:bg-white/70 transition"
          >
            {t("privacy.cta.cookies")}
          </Link>
        </div>
      </section>
    </main>
  );
}