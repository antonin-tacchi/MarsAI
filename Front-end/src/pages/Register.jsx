import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import Header from "../components/Header";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google OAuth
  const handleGoogleSuccess = (data) => {
    console.log("Google registration successful:", data);
    // Store token and user data
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    navigate("/");
  };

  const handleGoogleError = (error) => {
    console.error("Google registration error:", error);
    setApiError(error.message || "Google authentication failed");
  };

  const { isLoaded: isGoogleLoaded, signIn: signInWithGoogle } = useGoogleAuth(
    handleGoogleSuccess,
    handleGoogleError
  );

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 8) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
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
      const registerData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      };
      const response = await register(registerData);
      console.log("Registration successful:", response);
      navigate("/");
    } catch (error) {
      setApiError(error.message || "L'inscription a échoué. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 flex bg-[#262335]">
        {/* Left side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-12 bg-[#FBF5F0]">
          <div className="w-full max-w-xl px-4 md:px-6">
            {/* Tab Toggle */}
            <div className="flex bg-white rounded-full p-1 mb-8 border border-[#463699] text-base">
              <Link
                to="/login"
                className="flex-1 text-center py-2 px-4 rounded-full text-sm font-medium text-[#262335] hover:bg-gray-50 transition-colors"
              >
                Se connecter
              </Link>
              <div className="flex-1 text-center py-2 px-4 rounded-full text-sm font-medium bg-[#463699] text-white">
                S'inscrire
              </div>
            </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#262335] mb-3">
            S'inscrire
          </h1>

          <p className="text-sm md:text-base text-gray-600 mb-4">
            Si vous êtes <span className="font-semibold">jury</span> ou{" "}
            <span className="font-semibold">réalisateur</span>, veuillez utiliser le mot de passe reçu par email
          </p>

          <p className="text-sm md:text-base text-gray-600 mb-6">
            Si vous êtes <span className="font-semibold">visiteur</span>, vous pouvez créer un compte librement.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First and Last Name in Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm md:text-base font-medium text-[#262335] mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-md focus:outline-none focus:border-[#463699] text-[#262335] text-base"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm md:text-base font-medium text-[#262335] mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-md focus:outline-none focus:border-[#463699] text-[#262335] text-base"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                autoComplete="new-password"
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-md focus:outline-none focus:border-[#463699] text-[#262335] text-base"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
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

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C7C2CE]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#FBF5F0] text-[#262335]">ou se connecter avec</span>
              </div>
            </div>

            {/* Google signup */}
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!isGoogleLoaded}
              className="w-full bg-white border border-[#C7C2CE] py-3 rounded-md font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-[#262335]">S'inscrire avec Google</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-l from-[#8A83DA]/20 to-[#463699]/40"></div>
        </div>
      </div>
    </div>
    </div>
  );
}
