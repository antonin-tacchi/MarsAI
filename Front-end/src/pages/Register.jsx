import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { register } from "../services/authService";
import { getProfileRoute } from "../utils/roles";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLanguage } from "../context/LanguageContext";

const inputClass = (error) =>
  `w-full px-4 py-3.5 bg-[#12121A] border-2 rounded text-[#F5F0E8] placeholder:text-[#C8C0B0]/30 outline-none transition-all duration-200
  ${error ? "border-[#8B1A2E] bg-[#8B1A2E]/8" : "border-[#C9A84C]/15 focus:border-[#C9A84C]/60 focus:shadow-[0_0_12px_rgba(201,168,76,0.1)]"}`;

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
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
    if (!formData.firstName.trim()) newErrors.firstName = t("register.firstNameRequired");
    else if (formData.firstName.trim().length < 2) newErrors.firstName = t("register.firstNameMinLength");
    if (!formData.lastName.trim()) newErrors.lastName = t("register.lastNameRequired");
    else if (formData.lastName.trim().length < 2) newErrors.lastName = t("register.lastNameMinLength");
    if (!formData.email.trim()) newErrors.email = t("register.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = t("register.emailInvalid");
    if (!formData.password) newErrors.password = t("register.passwordRequired");
    else if (formData.password.length < 8) newErrors.password = t("register.passwordMinLength");
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) newErrors.password = t("register.passwordComplexity");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: `${formData.firstName} ${formData.lastName}`, email: formData.email, password: formData.password });
      const profile = getProfileRoute();
      navigate(profile ? profile.path : "/");
    } catch (error) {
      setApiError(error.message || t("register.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <Header />

      <div className="flex-1 flex">
        {/* Left — form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10 lg:p-16 bg-[#0A0A0F]">
          <div className="w-full max-w-md">

            {/* Tab toggle */}
            <div className="flex bg-[#12121A] rounded border border-[#C9A84C]/15 p-1 mb-10">
              <Link
                to="/login"
                className="flex-1 text-center py-2.5 px-4 rounded text-[11px] font-bold tracking-[0.2em] uppercase text-[#C8C0B0] hover:text-[#C9A84C] transition-colors"
              >
                {t("register.login")}
              </Link>
              <div className="flex-1 text-center py-2.5 px-4 rounded bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] text-[11px] font-bold tracking-[0.2em] uppercase">
                {t("register.title")}
              </div>
            </div>

            {/* Title */}
            <div className="mb-7">
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-2">
                — Nouveau compte —
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                {t("register.title")}
              </h1>
              <div className="mt-3 w-10 h-px bg-gradient-to-r from-[#C9A84C] to-transparent" />
            </div>

            <p className="text-[13px] text-[#C8C0B0]/70 mb-5 leading-relaxed">{t("register.juryNote")}</p>
            <p className="text-[13px] text-[#C8C0B0]/70 mb-7 leading-relaxed">{t("register.visitorNote")}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">{t("register.firstName")}</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="given-name" className={inputClass(errors.firstName)} />
                  {errors.firstName && <p className="text-[#B02240] text-[10px] mt-1 ml-1 font-semibold italic">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">{t("register.lastName")}</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="family-name" className={inputClass(errors.lastName)} />
                  {errors.lastName && <p className="text-[#B02240] text-[10px] mt-1 ml-1 font-semibold italic">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">{t("register.email")}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" className={inputClass(errors.email)} />
                {errors.email && <p className="text-[#B02240] text-[10px] mt-1 ml-1 font-semibold italic">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">{t("register.password")}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={inputClass(errors.password) + " pr-12"}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#C8C0B0]/50 hover:text-[#C9A84C] transition-colors">
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[#B02240] text-[10px] mt-1 ml-1 font-semibold italic">{errors.password}</p>}
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
                className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] py-4 rounded font-bold tracking-[0.2em] uppercase text-[12px] hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#0A0A0F]/40 border-t-[#0A0A0F] rounded-full animate-spin" />
                    {t("register.submitting")}
                  </span>
                ) : t("register.submit")}
              </button>
            </form>
          </div>
        </div>

        {/* Right — cinematic image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#0A0A0F]/30 to-[#0A0A0F]/60" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
          <div className="absolute bottom-12 right-12 z-10 text-right">
            <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-2">Festival International</p>
            <h2 className="font-display text-4xl font-black text-white leading-tight">
              Mars<span className="text-[#C9A84C]">AI</span>
            </h2>
            <div className="mt-3 w-10 h-px bg-[#C9A84C] ml-auto" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
