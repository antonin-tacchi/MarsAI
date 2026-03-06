import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function NewsletterConfirm() {
  const { t } = useLanguage();
  const [status, setStatus] = useState("loading");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("invalid");
      return;
    }

    fetch(`${API_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        setStatus(json.success ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#262335]/5 p-10 text-center">

          {status === "loading" && (
            <>
              <div className="w-12 h-12 border-4 border-[#463699]/20 border-t-[#463699] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[#262335]/60 text-sm">{t("newsletterConfirm.loading")}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-[#262335] mb-2">{t("newsletterConfirm.successTitle")}</h2>
              <p className="text-[#262335]/60 text-sm leading-relaxed mb-6">{t("newsletterConfirm.successText")}</p>
              <a href="/" className="inline-block px-6 py-3 bg-[#262335] text-white font-bold rounded-xl hover:bg-[#463699] transition-colors text-sm">
                {t("newsletterConfirm.backBtn")}
              </a>
            </>
          )}

          {(status === "error" || status === "invalid") && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-[#262335] mb-2">{t("newsletterConfirm.errorTitle")}</h2>
              <p className="text-[#262335]/60 text-sm leading-relaxed mb-6">{t("newsletterConfirm.errorText")}</p>
              <a href="/" className="inline-block px-6 py-3 bg-[#262335] text-white font-bold rounded-xl hover:bg-[#463699] transition-colors text-sm">
                {t("newsletterConfirm.backBtn")}
              </a>
            </>
          )}

        </div>
      </div>
    </div>
  );
}