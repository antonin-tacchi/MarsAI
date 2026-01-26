import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import AcceptInvitation from "./pages/AcceptInvitation.jsx";
import SubmitFilm from "./pages/SubmitFilm.jsx";
import About from "./pages/About.jsx";
import Catalogs from "./pages/Catalogs.jsx";
import Contact from "./pages/Contact.jsx";
import DetailsFilm from "./pages/DetailsFilm.jsx";
import PrizeList from "./pages/PrizeList.jsx";
import ProfileAdmin from "./pages/ProfileAdmin.jsx";
import ProfileJury from "./pages/ProfileJury.jsx";
import Regulation from "./pages/Regulations.jsx";
import Submissions from "./pages/Submissions.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - without header/footer */}
        <Route path="login" element={<Login />} />
        <Route path="invite/:token" element={<AcceptInvitation />} />

        {/* Film submission - without header/footer */}
        <Route path="submit" element={<SubmitFilm />} />

        {/* Main routes - with header/footer */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="details-film" element={<DetailsFilm />} />
          <Route path="details-film/:id" element={<DetailsFilm />} />
          <Route path="prize-list" element={<PrizeList />} />
          <Route path="regulation" element={<Regulation />} />
          <Route path="submissions" element={<Submissions />} />

          {/* Protected routes (jury/admin) */}
          <Route path="dashboard" element={<ProfileJury />} />
          <Route path="admin" element={<ProfileAdmin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
