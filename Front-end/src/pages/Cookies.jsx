import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Cookies() {
  const { t } = useLanguage();

  return (
    <main className="bg-[#f6f1ea]">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-[#1f1f2b]">
          {t("cookies.title")}
        </h1>

        <div className="mt-10 bg-white/60 rounded-2xl p-8 md:p-10 border border-black/5">
          <p className="text-[#2b2b3a] leading-relaxed">{t("cookies.intro")}</p>

          <div className="mt-10 space-y-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("cookies.s1.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("cookies.s1.p")}
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("cookies.s2.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("cookies.s2.p")}
              </p>
              <ul className="mt-4 space-y-2 text-[#2b2b3a]">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 inline-block w-2 h-2 rounded-full bg-[#1f1f2b]" />
                    <span className="leading-relaxed">
                      {t(`cookies.s2.li${i}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                {t("cookies.s3.title")}
              </h2>
              <p className="mt-3 text-[#2b2b3a] leading-relaxed">
                {t("cookies.s3.p")}
              </p>
            </div>
          </div>

          <div className="mt-10 text-sm text-[#2b2b3a]/80">{t("cookies.tip")}</div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/privacy"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-white text-[#1f1f2b] hover:bg-white/70 transition"
          >
            {t("cookies.cta.privacy")}
          </Link>

          <Link
            to="/contact"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-[#1f1f2b] text-white hover:opacity-95 transition"
          >
            {t("cookies.cta.contact")}
          </Link>
        </div>
      </section>
    </main>
  );
}