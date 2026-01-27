import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await login(formData);
      console.log("Login successful:", response);
      navigate("/dashboard");
    } catch (error) {
      setApiError(error.message || "La connexion a echoue. Verifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#262335] to-[#463699]">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="text-center text-white">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-5xl font-bold">MarsAI</h1>
            <p className="text-xl mt-2 opacity-80">Festival</p>
          </Link>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Espace Jury & Administration</h2>
            <p className="text-white/70">
              Gerez les soumissions de films, validez les candidatures et suivez les statistiques du festival.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-[#FBF5F0]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block">
              <h1 className="text-3xl font-bold text-[#262335]">MarsAI Festival</h1>
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#262335] mb-2">
              Connexion
            </h1>
            <p className="text-gray-600">
              Espace reserve aux membres du jury et administrateurs
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#262335] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] text-[#262335]"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#262335] mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] text-[#262335]"
                placeholder="Votre mot de passe"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Error message */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{apiError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#463699] text-white py-3.5 rounded-lg font-semibold hover:bg-[#362a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-[#463699] hover:underline text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
