import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ResetPassword() {
  const { t, lang } = useLanguage();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tok = params.get("token");
    if (!tok) setStatus("invalid");
    else setToken(tok);
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) return setError(t("resetPassword.errorMin"));
    if (password !== confirm) return setError(t("resetPassword.errorMatch"));
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("idle");
    }
  };

  const strength = () => {
    if (!password) return null;
    const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    const score = checks.filter(Boolean).length;
    const labels = [
      t("resetPassword.strengthWeak"),
      t("resetPassword.strengthMedium"),
      t("resetPassword.strengthStrong"),
      t("resetPassword.strengthVeryStrong"),
    ];
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
    return { score, label: labels[score - 1], color: colors[score - 1] };
  };

  const pwdStrength = strength();

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-[#FBF5F0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#262335] mb-2">{t("resetPassword.invalidTitle")}</h2>
          <p className="text-[#262335]/60 text-sm mb-6">{t("resetPassword.invalidText")}</p>
          <a href="/forgot-password" className="inline-block px-6 py-3 bg-[#262335] text-white rounded-xl font-bold text-sm hover:bg-[#463699] transition-colors">
            {t("resetPassword.newLinkBtn")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF5F0] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#262335]">MarsAI</h1>
          <p className="text-sm text-[#262335]/50 mt-1 uppercase tracking-widest">Festival</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {status === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-[#262335] mb-2">{t("resetPassword.successTitle")}</h2>
              <p className="text-[#262335]/60 text-sm mb-6">{t("resetPassword.successText")}</p>
              <a href="/login" className="inline-block px-6 py-3 bg-[#262335] text-white rounded-xl font-bold text-sm hover:bg-[#463699] transition-colors">
                {t("resetPassword.loginBtn")}
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#262335] mb-2">{t("resetPassword.title")}</h2>
              <p className="text-sm text-[#262335]/60 mb-6">{t("resetPassword.subtitle")}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#262335] mb-1">{t("resetPassword.newPassword")}</label>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699]"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262335]/40 hover:text-[#463699] text-lg">
                      {showPwd ? "🙈" : "👁"}
                    </button>
                  </div>
                  {pwdStrength && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength.score ? pwdStrength.color : "bg-[#262335]/10"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-[#262335]/50 mt-1">{pwdStrength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#262335] mb-1">{t("resetPassword.confirmPassword")}</label>
                  <input
                    type={showPwd ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                      confirm && confirm !== password ? "border-red-300 focus:border-red-400"
                      : confirm && confirm === password ? "border-green-300 focus:border-green-400"
                      : "border-[#262335]/10 focus:border-[#463699]"
                    }`}
                  />
                  {confirm && confirm !== password && (
                    <p className="text-red-500 text-xs mt-1">{t("resetPassword.mismatch")}</p>
                  )}
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!password || !confirm || status === "loading"}
                  className="w-full py-3 bg-[#262335] text-white font-bold rounded-xl hover:bg-[#463699] transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? t("resetPassword.submitting") : t("resetPassword.submit")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}