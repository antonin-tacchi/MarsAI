import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Legal() {
  const { t } = useLanguage();

  return (
    <main className="bg-[#f6f1ea]">
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-center text-4xl md:text-5xl font-extrabold text-[#1f1f2b]">
          {t("legal.title")}
        </h1>

        <div className="mt-10 bg-white/60 rounded-2xl p-8 md:p-10 border border-black/5">
          <div className="mt-10 space-y-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <h2 className="text-xl md:text-2xl font-bold text-[#1f1f2b]">
                  {t(`legal.s${i}.title`)}
                </h2>
                <p className="mt-3 text-[#2b2b3a] leading-relaxed whitespace-pre-line">
                  {t(`legal.s${i}.p`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Link
            to="/privacy"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-white text-[#1f1f2b] hover:bg-white/70 transition"
          >
            {t("legal.cta.privacy")}
          </Link>

          <Link
            to="/cookies"
            className="w-full md:w-auto text-center px-6 py-3 rounded-md border border-[#1f1f2b]/20 bg-[#1f1f2b] text-white hover:opacity-95 transition"
          >
            {t("legal.cta.cookies")}
          </Link>
        </div>
      </section>
    </main>
  );
}