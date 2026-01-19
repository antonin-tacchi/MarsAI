import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Regulation from "./pages/Regulations.jsx";
import Submissions from "./pages/Submissions.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="catalogs" element={<Catalogs />} />
          <Route path="contact" element={<Contact />} />
          <Route path="details-film" element={<DetailsFilm />} />
          <Route path="prize-list" element={<PrizeList />} />
          <Route path="profile-admin" element={<ProfileAdmin />} />
          <Route path="profile-director" element={<ProfileDirector />} />
          <Route path="profile-jury" element={<ProfileJury />} />
          <Route path="regulation" element={<Regulation />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
