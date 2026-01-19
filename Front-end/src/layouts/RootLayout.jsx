import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <header><Header /></header>
      <main>
        <Outlet />
      </main>
      <footer><Footer /></footer>
    </div>
  );
}
