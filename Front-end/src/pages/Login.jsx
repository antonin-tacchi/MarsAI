import { useState } from "react";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email obligatoire";
    }

    if (!password.trim()) {
      newErrors.password = "Mot de passe obligatoire"
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
     setLoading(false);
     setApiError("Email ou mot de passe incorrect");
    }, 1500);
  };


  return (
    <div className="auth-container">
      <h1>Connexion</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: ""})
            }}
            placeholder="Entrez votre email"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({...errors, password: "" });
            }}
            placeholder="Entrez votre mot de passe"
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        {apiError && <p className="error global-error">{apiError}</p>}

        <button type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
