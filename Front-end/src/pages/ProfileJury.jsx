import { useNavigate } from "react-router-dom";
import { logout } from "../services/authService";

export default function ProfileJury() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">PROFIL JURY PAGE</h1>

      <button
        onClick={handleLogout}
        className="px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
      >
        Se déconnecter
      </button>
    </div>
  );
}
