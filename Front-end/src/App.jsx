import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Catalogs from "./pages/Catalogs.jsx";
import Contact from "./pages/Contact.jsx";
import DetailsFilm from "./pages/DetailsFilm.jsx";
import Jury from "./pages/JuryMembers.jsx";
import PrizeList from "./pages/PrizeList.jsx";
import ProfileAdmin from "./pages/ProfileAdmin.jsx";
import ProfileDirector from "./pages/ProfileDirector.jsx";
import ProfileJury from "./pages/ProfileJury.jsx";
import ProfileSuperJury from "./pages/ProfileSuperJury.jsx";
import Regulation from "./pages/Regulations.jsx";
import Submissions from "./pages/Submissions.jsx";
import NotFound from "./pages/NotFound.jsx";
import AdminModeration from "./pages/AdminModeration.jsx";
import Partners from "./pages/Partners.jsx";
import InfosPratiques from "./pages/PracticalInfo.jsx";
import Privacy from "./pages/Privacy.jsx";
import Cookies from "./pages/Cookies.jsx";
import Legal from "./pages/Legal.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import NewsletterSubscribe from "./components/NewsletterSubscribe.jsx";
import NewsletterConfirm from "./pages/NewsletterConfirm.jsx";


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  // Détecte si le jury doit changer son mot de passe à la 1ère connexion
  const checkMustReset = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      // Le backend met must_reset_password=true uniquement pour les jurys
      return user.must_reset_password === true || user.must_reset_password === 1;
    } catch { return false; }
  };

  const [mustReset, setMustReset] = useState(checkMustReset);

  // Se déclenche après chaque login (Login.jsx dispatch "auth-change")
  useEffect(() => {
    const handler = () => setMustReset(checkMustReset());
    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  const handlePasswordChanged = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...user, must_reset_password: false }));
    setMustReset(false);
  };

  return (
    <BrowserRouter>
      {/* Modal bloquante si 1ère connexion jury */}
      {mustReset && <ChangePassword forceMode onSuccess={handlePasswordChanged} />}

      <ScrollToTop />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="details-film/:id" element={<DetailsFilm />} />
          <Route path="nos-partenaires" element={<Partners/>} />
          <Route path="membres-du-jury" element={<Jury/>} />
          <Route path="prize-list" element={<PrizeList />} />
          <Route path="regulation" element={<Regulation />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="practicalinfos" element={<InfosPratiques />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="cookies" element={<Cookies />} />
          <Route path="legal" element={<Legal />} />
          <Route path="newsletter-subscribe" element={<NewsletterSubscribe />} />
          <Route path="newsletter/confirm" element={<NewsletterConfirm />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="change-password" element={<ChangePassword />} />
          <Route
            path="profile-admin"
            element={
              <ProtectedRoute>
                <ProfileAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin-moderation"
            element={
              <ProtectedRoute>
                <AdminModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile-director"
            element={
              <ProtectedRoute>
                <ProfileDirector />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile-jury"
            element={
              <ProtectedRoute>
                <ProfileJury />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile-superjury"
            element={
              <ProtectedRoute>
                <ProfileSuperJury />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}