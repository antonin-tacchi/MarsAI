import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [invitation, setInvitation] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/invite/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Invitation invalide");
          setLoading(false);
          return;
        }

        setInvitation(data.data);
        setFormData((prev) => ({
          ...prev,
          name: data.data.name || "",
        }));
      } catch (err) {
        setError("Erreur lors de la verification de l'invitation");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caracteres");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/invite/${token}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de la creation du compte");
        setSubmitting(false);
        return;
      }

      // Store token and redirect to dashboard
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Erreur lors de la creation du compte");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#262335] to-[#463699]">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#262335] to-[#463699] p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#262335] mb-2">Invitation invalide</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block bg-[#463699] text-white px-6 py-3 rounded-lg hover:bg-[#362a7a] transition-colors"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-semibold mb-4">Bienvenue dans l'equipe !</h2>
            <p className="text-white/70">
              Vous avez ete invite a rejoindre l'equipe du MarsAI Festival.
              Configurez votre compte pour commencer.
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

          {/* Invitation info */}
          <div className="bg-[#463699]/10 rounded-lg p-4 mb-6">
            <p className="text-sm text-[#262335]">
              <span className="font-medium">Invite par:</span> {invitation?.invitedBy}
            </p>
            <p className="text-sm text-[#262335]">
              <span className="font-medium">Role:</span> {invitation?.role}
            </p>
            <p className="text-sm text-[#262335]">
              <span className="font-medium">Email:</span> {invitation?.email}
            </p>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#262335] mb-2">
              Creer votre compte
            </h1>
            <p className="text-gray-600">
              Definissez votre mot de passe pour activer votre compte
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#262335] mb-2">
                Nom complet
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] text-[#262335]"
                placeholder="Votre nom"
              />
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
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] text-[#262335]"
                placeholder="Minimum 6 caracteres"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#262335] mb-2">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] text-[#262335]"
                placeholder="Confirmez votre mot de passe"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#463699] text-white py-3.5 rounded-lg font-semibold hover:bg-[#362a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {submitting ? "Creation en cours..." : "Activer mon compte"}
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
