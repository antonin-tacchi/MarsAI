import { Link } from "react-router-dom";
import Header from "../components/Header";
import { useLanguage } from "../context/LanguageContext";

export default function InfosPratiques() {
  const { t } = useLanguage();

  const programme = [
    { time: "09:30", title: t("practicalInfo.schedule1Title"), pill: t("practicalInfo.schedule1Pill") },
    { time: "10:30", title: t("practicalInfo.schedule2Title"), sub: t("practicalInfo.schedule2Sub") },
    { time: "13:00", title: t("practicalInfo.schedule3Title") },
    { time: "14:30", title: t("practicalInfo.schedule4Title") },
    { time: "16:30", title: t("practicalInfo.schedule5Title"), sub: t("practicalInfo.schedule5Sub") },
    { time: "19:00", title: t("practicalInfo.schedule6Title") },
    { time: "21:00", title: t("practicalInfo.schedule7Title"), sub: t("practicalInfo.schedule7Sub"), pill: t("practicalInfo.schedule7Pill") },
  ];

  const acces = [
    { icon: "🚇", title: t("practicalInfo.access1Title"), desc: t("practicalInfo.access1Desc") },
    { icon: "🚗", title: t("practicalInfo.access2Title"), desc: t("practicalInfo.access2Desc") },
    { icon: "✈️", title: t("practicalInfo.access3Title"), desc: t("practicalInfo.access3Desc") },
    { icon: "🚆", title: t("practicalInfo.access4Title"), desc: t("practicalInfo.access4Desc") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF5F0]">

      {/* Back nav */}
      <nav className="bg-white border-b border-[#C7C2CE] px-8 py-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6578] hover:text-[#463699] transition-colors"
        >
          {t("practicalInfo.backHome")}
        </Link>
      </nav>

      {/* Page header */}
      <header className="bg-[#262335] px-8 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#463699]/50 to-[#8A83DA]/15 pointer-events-none" />
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#8A83DA]/20 blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-[#8A83DA] text-sm font-medium px-3 py-1 rounded-full mb-4">
            {t("practicalInfo.label")}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            13 Juin 2026
            <br />
            <span className="text-[#8A83DA]">Marseille</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col gap-10">

        {/* La Plateforme */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-[#262335] mb-5">
            {t("practicalInfo.venueTitle")}
          </h2>
          <div className="bg-white border border-[#C7C2CE] rounded-md p-6">
            <p className="text-base text-[#6B6578] leading-relaxed">
              {t("practicalInfo.venueDesc")}{" "}
              <a href="#" className="text-[#463699] font-semibold hover:underline">
                {t("practicalInfo.venueName")}
              </a>
              .
            </p>
          </div>
        </section>

        {/* Programme */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-[#262335] mb-5">
            {t("practicalInfo.scheduleTitle")}
          </h2>
          <div className="bg-white border border-[#C7C2CE] rounded-md overflow-hidden">
            {programme.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[80px_1fr] gap-4 px-6 py-4 border-b last:border-b-0 border-[#C7C2CE] items-center hover:bg-[#f5f3ff] transition-colors"
              >
                <span className="text-base font-semibold text-[#463699] tabular-nums">{item.time}</span>
                <div>
                  <p className="text-base font-medium text-[#262335]">{item.title}</p>
                  {item.sub && <p className="text-sm text-[#6B6578] mt-0.5">{item.sub}</p>}
                  {item.pill && (
                    <span className="inline-block mt-1 text-sm font-medium bg-[#eeeaf9] text-[#463699] px-2.5 py-0.5 rounded-full">
                      {item.pill}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accès */}
        <section>
          <h2 className="text-3xl md:text-4xl font-bold text-[#262335] mb-5">
            {t("practicalInfo.accessTitle")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {acces.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-[#C7C2CE] rounded-md p-5 flex gap-4 items-start hover:border-[#463699] transition-all"
              >
                <div className="w-10 h-10 bg-[#262335] rounded-md flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#262335] mb-1">
                    {item.title}
                  </h4>
                  <p className="text-sm text-[#6B6578] leading-relaxed whitespace-pre-line">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="mt-4 rounded-md overflow-hidden border border-[#C7C2CE]">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=5.33,43.27,5.40,43.32&layer=mapnik&marker=43.2965,5.3698"
              className="w-full h-64 block"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title={t("practicalInfo.mapTitle")}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
