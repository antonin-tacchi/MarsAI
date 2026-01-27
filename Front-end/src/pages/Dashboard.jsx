import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAdmin, isSuperJury } from "../services/authService";

/**
 * Dashboard - Redirects to the appropriate page based on user role
 */
export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Redirect based on role priority: Admin > Super Jury > Jury
    if (isAdmin()) {
      navigate("/profile-admin", { replace: true });
    } else if (isSuperJury()) {
      navigate("/super-jury", { replace: true });
    } else {
      navigate("/profile-jury", { replace: true });
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#463699] mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
}
