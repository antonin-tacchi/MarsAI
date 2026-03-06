import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function NewsletterSubscribe({ className = "" }) {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    setError("");
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`${className} text-center`}>
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-xl font-bold text-sm">
          ✅ {t("newsletterSubscribe.successMsg")}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2 flex-col sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("newsletterSubscribe.placeholder")}
          className="flex-1 px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-[#262335] bg-white text-sm"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!email || status === "loading"}
          className="px-6 py-3 bg-[#463699] text-white font-bold rounded-xl hover:bg-[#262335] transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
        >
          {status === "loading" ? t("newsletterSubscribe.loading") : t("newsletterSubscribe.submit")}
        </button>
      </div>
      {(status === "error" || error) && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
      <p className="text-xs text-[#262335]/40 mt-2">
        {t("newsletterSubscribe.hint")}
      </p>
    </div>
  );
}