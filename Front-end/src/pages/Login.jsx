import { useState } from "react";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="auth-container">
      <h1>Connexion</h1>

      <form>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
          />  
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrez votre mot de passe"
          />
        </div>

        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}
