import { use, useState } from "react";


export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  cont [confirmPassword, setConfirmPassword] = useState ("");

  const [errors, setErrors] = useState({});
  const [apiErrors, setapiErrors] = useStat({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email obligatoire";
    }

    if (!password.trim()) {
      newErrors.password = "Mot de passe obligatoire";
    } else if (password.length < 8) {
      newErrors.password = "Mot de passe minimum 8 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setapiErrors("");

    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setapiErrors("Email déjà utilisé");
    }, 1500);
  };

  return (
    <div className="auth-container">
      <h1>Inscription</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) =>{ 
              setEmail(e.target.value);
              setErrors({...errors, email:""})
            }}
            placeholder="Entrez votre email"
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

        <div>
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>{
              setConfirmPassword(e.target.value);
              setErrors({...errors, confirmPassword: ""});
            }}
            placeholder="Confirmez votre mot de passe"
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}
        </div>

        {apiErrors && <p className="error global-error">{apiError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}