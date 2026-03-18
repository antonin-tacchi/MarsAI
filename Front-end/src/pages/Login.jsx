import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "../services/authService";
import { getProfileRoute } from "../utils/roles";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = t("login.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("login.emailInvalid");
    if (!formData.password.trim()) newErrors.password = t("login.passwordRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await login(formData);
      window.dispatchEvent(new Event("auth-change"));
      const profile = getProfileRoute();
      navigate(profile ? profile.path : "/");
    } catch (error) {
      setApiError(error.message || t("login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Header />

      <div className="flex-1 flex">
        {/* Left — cinematic image panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0F]/30 to-[#0A0A0F]/60" />

          {/* Gold top line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

          {/* Festival branding */}
          <div className="absolute bottom-12 left-12 z-10">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-2">
              Festival International
            </p>
            <h2 className="font-display text-4xl font-black text-white leading-tight">
              Mars<span className="text-[#C9A84C]">AI</span>
            </h2>
            <div className="mt-3 w-10 h-px bg-[#C9A84C]" />
          </div>
        </div>

        {/* Right — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-[#0A0A0F]">
          <div className="w-full max-w-md">

            {/* Tab toggle */}
            <div className="flex bg-[#12121A] rounded border border-[#C9A84C]/15 p-1 mb-10">
              <div className="flex-1 text-center py-2.5 px-4 rounded bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] text-[11px] font-bold tracking-[0.2em] uppercase">
                {t("login.title")}
              </div>
              <Link
                to="/register"
                className="flex-1 text-center py-2.5 px-4 rounded text-[11px] font-bold tracking-[0.2em] uppercase text-[#C8C0B0] hover:text-[#C9A84C] transition-colors"
              >
                {t("login.register")}
              </Link>
            </div>

            {/* Title */}
            <div className="mb-8">
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-2">
                — Accès membres —
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                {t("login.title")}
              </h1>
              <div className="mt-3 w-10 h-px bg-gradient-to-r from-[#C9A84C] to-transparent" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className={`w-full px-4 py-3.5 bg-[#12121A] border-2 rounded text-[#F5F0E8] placeholder:text-[#C8C0B0]/30 outline-none transition-all duration-200
                    ${errors.email ? "border-[#8B1A2E] bg-[#8B1A2E]/8" : "border-[#C9A84C]/15 focus:border-[#C9A84C]/60 focus:shadow-[0_0_12px_rgba(201,168,76,0.1)]"}`}
                />
                {errors.email && <p className="text-[#B02240] text-[10px] mt-1.5 ml-1 font-semibold italic">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">
                  {t("login.password")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    className={`w-full px-4 py-3.5 pr-12 bg-[#12121A] border-2 rounded text-[#F5F0E8] placeholder:text-[#C8C0B0]/30 outline-none transition-all duration-200
                      ${errors.password ? "border-[#8B1A2E] bg-[#8B1A2E]/8" : "border-[#C9A84C]/15 focus:border-[#C9A84C]/60 focus:shadow-[0_0_12px_rgba(201,168,76,0.1)]"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C8C0B0]/50 hover:text-[#C9A84C] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#B02240] text-[10px] mt-1.5 ml-1 font-semibold italic">{errors.password}</p>}
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-[12px] text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">
                    {t("login.forgotPassword")}
                  </Link>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="bg-[#8B1A2E]/15 border border-[#8B1A2E]/40 rounded p-3">
                  <p className="text-[#E8607A] text-[13px]">{apiError}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] py-4 rounded font-bold tracking-[0.2em] uppercase text-[12px] hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0A0A0F]/40 border-t-[#0A0A0F] rounded-full animate-spin" />
                    {t("login.submitting")}
                  </span>
                ) : t("login.submit")}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
