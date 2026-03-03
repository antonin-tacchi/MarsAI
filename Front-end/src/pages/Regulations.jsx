import { useLanguage } from "../context/LanguageContext";

export default function Regulations() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#FBF5F0] min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b-2 border-[#262335] pb-8">
          <p className="text-sm font-bold tracking-widest text-[#463699] uppercase mb-3">
            {t("regulations.pageLabel")}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-[#262335] uppercase italic leading-tight">
            {t("regulations.pageTitle")}
          </h1>
        </div>

        <div className="space-y-12 text-[#262335]">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                1
              </span>
              {t("regulations.section1Title")}
            </h2>
            <ul className="space-y-4 pl-11">
              {[
                t("regulations.section1Item1"),
                t("regulations.section1Item2"),
                t("regulations.section1Item3"),
                t("regulations.section1Item4"),
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-base leading-relaxed">
                  <span className="font-bold text-[#463699] flex-shrink-0">1.{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                2
              </span>
              {t("regulations.section2Title")}
            </h2>
            <div className="pl-11 space-y-6">
              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.1.</span> {t("regulations.section2p1")}
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2sub1Label")}</strong> {t("regulations.section2sub1Text")}
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2sub2Label")}</strong> {t("regulations.section2sub2Text")}
                    </span>
                  </li>
                </ul>
              </div>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">2.2. </span>
                <span className="font-bold">{t("regulations.section2p2Label")} </span>
                {t("regulations.section2p2Text")}
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.3. </span>
                  <span className="font-bold">{t("regulations.section2p3Label")} </span>
                  {t("regulations.section2p3Intro")}
                </p>
                <ul className="space-y-4 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2sub3Label")}</strong> {t("regulations.section2sub3Text")}
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2sub4Label")}</strong> {t("regulations.section2sub4Text")}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.4. </span>
                  <span className="font-bold">{t("regulations.section2p4Label")} </span>
                  {t("regulations.section2p4Intro")}
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>{t("regulations.section2sub5")}</span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>{t("regulations.section2sub6")}</span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span className="font-bold text-red-700">{t("regulations.section2sub7")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                3
              </span>
              {t("regulations.section3Title")}
            </h2>
            <div className="pl-11 space-y-6">
              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.1. </span>
                {t("regulations.section3p1")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.2. </span>
                {t("regulations.section3p2")}
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">3.3. </span>
                  {t("regulations.section3p3")}
                </p>
                <ul className="space-y-3 pl-4">
                  {[
                    { label: t("regulations.section3subALabel"), text: t("regulations.section3subAText") },
                    { label: t("regulations.section3subBLabel"), text: t("regulations.section3subBText") },
                    { label: t("regulations.section3subCLabel"), text: t("regulations.section3subCText") },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                      <span>
                        <strong>{item.label}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.4. </span>
                {t("regulations.section3p4")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.5. </span>
                {t("regulations.section3p5")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.6. </span>
                {t("regulations.section3p6")}
              </p>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-[#262335]/20">
          <p className="text-xs text-[#262335]/50 text-center">
            {t("regulations.footerNote")}
          </p>
        </div>

      </div>
    </div>
  );
}
