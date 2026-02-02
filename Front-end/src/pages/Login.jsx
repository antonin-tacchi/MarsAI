import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/authService";
import Header from "../components/Header";

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
      navigate("/");
    } catch (error) {
      setApiError(error.message || "La connexion a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex bg-[#262335]">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#8A83DA]/20 to-[#463699]/40"></div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-[#FBF5F0]">
          <div className="w-full max-w-xl px-4 md:px-6">
            {/* Tab Toggle */}
            <div className="flex bg-white rounded-full p-1 mb-8 border border-[#463699] text-base">
              <div className="flex-1 text-center py-2 px-4 rounded-full text-sm font-medium bg-[#463699] text-white">
                Se connecter
              </div>
              <Link
                to="/register"
                className="flex-1 text-center py-2 px-4 rounded-full text-sm font-medium text-[#262335] hover:bg-gray-50 transition-colors"
              >
                S'inscrire
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-[#262335] mb-8">
              Se connecter
            </h1>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm md:text-base font-medium text-[#262335] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-md focus:outline-none focus:border-[#463699] text-[#262335] text-base"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm md:text-base font-medium text-[#262335] mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-md focus:outline-none focus:border-[#463699] text-[#262335] text-base"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
                <div className="text-right mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#463699] hover:underline"
                  >
                    mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Error message */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{apiError}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#262335] text-white py-3.5 rounded-md font-semibold hover:bg-[#463699] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 text-base md:text-lg"
              >
                {loading ? "Connexion..." : "Connexion"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
