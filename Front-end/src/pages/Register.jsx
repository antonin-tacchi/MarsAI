import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
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
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre";
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
      // New users get Jury role by default, redirect to jury dashboard
      navigate("/profile-jury");
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
              <span className="font-semibold">réalisateur</span>, veuillez
              utiliser le mot de passe reçu par email
            </p>

            <p className="text-sm md:text-base text-gray-600 mb-6">
              Si vous êtes <span className="font-semibold">visiteur</span>, vous
              pouvez créer un compte librement.
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
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
                {loading ? "Inscription..." : "S'inscrire"}
              </button>
            </form>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=2070')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-[#8A83DA]/20 to-[#463699]/40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
