import { useLanguage } from "../context/LanguageContext";

export default function Regulations() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#FBF5F0] min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b-2 border-[#262335] pb-8">
          <p className="text-sm font-bold tracking-widest text-[#463699] uppercase mb-3">
            {t("regulations.label")}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-[#262335] uppercase italic leading-tight">
            {t("regulations.title")}
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
                t("regulations.section1_1"),
                t("regulations.section1_2"),
                t("regulations.section1_3"),
                t("regulations.section1_4"),
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
                  <span className="text-[#463699]">2.1.</span> {t("regulations.section2_1")}
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2_1aLabel")}</strong> {t("regulations.section2_1a")}
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2_1bLabel")}</strong> {t("regulations.section2_1b")}
                    </span>
                  </li>
                </ul>
              </div>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">2.2. </span>
                <span className="font-bold">{t("regulations.section2_2Label")} </span>
                {t("regulations.section2_2")}
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.3. </span>
                  <span className="font-bold">{t("regulations.section2_3Label")} </span>
                  {t("regulations.section2_3")}
                </p>
                <ul className="space-y-4 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2_3aLabel")}</strong> {t("regulations.section2_3a")}
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>{t("regulations.section2_3bLabel")}</strong> {t("regulations.section2_3b")}
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.4. </span>
                  <span className="font-bold">{t("regulations.section2_4Label")} </span>
                  {t("regulations.section2_4")}
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>{t("regulations.section2_4a")}</span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>{t("regulations.section2_4b")}</span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span className="font-bold text-red-700">{t("regulations.section2_4c")}</span>
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
                {t("regulations.section3_1")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.2. </span>
                {t("regulations.section3_2")}
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">3.3. </span>
                  {t("regulations.section3_3")}
                </p>
                <ul className="space-y-3 pl-4">
                  {[
                    { label: t("regulations.section3_3aLabel"), text: t("regulations.section3_3a") },
                    { label: t("regulations.section3_3bLabel"), text: t("regulations.section3_3b") },
                    { label: t("regulations.section3_3cLabel"), text: t("regulations.section3_3c") },
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
                {t("regulations.section3_4")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.5. </span>
                {t("regulations.section3_5")}
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.6. </span>
                {t("regulations.section3_6")}
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
