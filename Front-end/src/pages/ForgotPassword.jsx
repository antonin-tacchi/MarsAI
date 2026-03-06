import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ForgotPassword() {
  const { t, lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) return;
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setStatus("sent");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5F0] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#262335]">MarsAI</h1>
          <p className="text-sm text-[#262335]/50 mt-1 uppercase tracking-widest">Festival</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {status === "sent" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-bold text-[#262335] mb-2">
                {t("forgotPassword.successTitle")}
              </h2>
              <p className="text-[#262335]/60 text-sm leading-relaxed">
                {t("forgotPassword.successText")}
              </p>
              <a href="/login" className="inline-block mt-6 text-[#463699] font-bold text-sm hover:underline">
                ← {t("forgotPassword.backToLogin")}
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#262335] mb-2">
                {t("forgotPassword.title")}
              </h2>
              <p className="text-sm text-[#262335]/60 mb-6">
                {t("forgotPassword.subtitle")}
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#262335] mb-1">
                    {t("forgotPassword.emailLabel")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699] text-[#262335]"
                    autoFocus
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!email || status === "loading"}
                  className="w-full py-3 bg-[#262335] text-white font-bold rounded-xl hover:bg-[#463699] transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? t("forgotPassword.submitting") : t("forgotPassword.submit")}
                </button>
              </div>

              <div className="mt-6 text-center">
                <a href="/login" className="text-[#462335]/50 text-sm hover:text-[#463699] hover:underline">
                  ← {t("forgotPassword.backToLogin")}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}