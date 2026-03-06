import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ChangePassword({ onSuccess, forceMode = false }) {
  const { t, lang } = useLanguage();
  const token = localStorage.getItem("token");

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (password.length < 8) return setError(t("changePassword.errorMin"));
    if (password !== confirm) return setError(t("changePassword.errorMatch"));
    if (password === current) return setError(t("changePassword.errorSame"));

    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: password, lang }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setStatus("success");
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, must_reset_password: false }));
      setTimeout(() => onSuccess?.(), 1500);
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
      t("changePassword.strengthWeak"),
      t("changePassword.strengthMedium"),
      t("changePassword.strengthStrong"),
      t("changePassword.strengthVeryStrong"),
    ];
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
    return { score, label: labels[score - 1], color: colors[score - 1] };
  };

  const pwdStrength = strength();

  const content = (
    <>
      {forceMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800 font-bold text-sm">{t("changePassword.forceNotice")}</p>
        </div>
      )}

      {status === "success" ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">✅</div>
          <p className="font-bold text-[#262335]">{t("changePassword.successTitle")}</p>
          <p className="text-sm text-[#262335]/50 mt-1">{t("changePassword.redirecting")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#262335] mb-1">{t("changePassword.currentPassword")}</label>
            <input type={showPwd ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699]" />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#262335] mb-1">{t("changePassword.newPassword")}</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-[#262335]/10 rounded-xl focus:outline-none focus:border-[#463699]" />
              <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#262335]/40 hover:text-[#463699]">
                {showPwd ? "🙈" : "👁"}
              </button>
            </div>
            {pwdStrength && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= pwdStrength.score ? pwdStrength.color : "bg-[#262335]/10"}`} />)}
                </div>
                <p className="text-xs text-[#262335]/50 mt-1">{pwdStrength.label}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#262335] mb-1">{t("changePassword.confirmPassword")}</label>
            <input type={showPwd ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                confirm && confirm !== password ? "border-red-300" : confirm && confirm === password ? "border-green-300" : "border-[#262335]/10 focus:border-[#463699]"
              }`} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="button" onClick={handleSubmit} disabled={!current || !password || !confirm || status === "loading"}
            className="w-full py-3 bg-[#262335] text-white font-bold rounded-xl hover:bg-[#463699] transition-colors disabled:opacity-50">
            {status === "loading" ? t("changePassword.submitting") : t("changePassword.submit")}
          </button>
        </div>
      )}
    </>
  );

  if (forceMode) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-xl font-bold text-[#262335] mb-4">{t("changePassword.titleForce")}</h2>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#262335] mb-4">{t("changePassword.title")}</h2>
      {content}
    </div>
  );
}