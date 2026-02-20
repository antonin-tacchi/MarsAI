import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import About from "./pages/About.jsx";
import Catalogs from "./pages/Catalogs.jsx";
import Contact from "./pages/Contact.jsx";
import DetailsFilm from "./pages/DetailsFilm.jsx";
import PrizeList from "./pages/PrizeList.jsx";
import ProfileAdmin from "./pages/ProfileAdmin.jsx";
import ProfileDirector from "./pages/ProfileDirector.jsx";
import ProfileJury from "./pages/ProfileJury.jsx";
import ProfileSuperJury from "./pages/ProfileSuperJury.jsx";
import Regulation from "./pages/Regulations.jsx";
import Submissions from "./pages/Submissions.jsx";
import NotFound from "./pages/NotFound.jsx";


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
  return (
    <BrowserRouter>
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
          <Route path="prize-list" element={<PrizeList />} />
          <Route path="regulation" element={<Regulation />} />
          <Route path="submissions" element={<Submissions />} />
          <Route
            path="profile-admin"
            element={
              <ProtectedRoute>
                <ProfileAdmin />
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
