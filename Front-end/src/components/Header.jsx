import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import logoClair from "../images/logo-clair.png";
import logoSombre from "../images/logo-sombre.png";
import logoPlateforme from "../images/logo-laplateforme-2024.png";
import mobileFilmLogo from "../images/mobile-film-logo.png";

export default function Header() {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("FR");

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const links = [
    { to: "/about", label: "Le festival" },
    { to: "/catalogs", label: "Catalogue" },
    { to: "/submit", label: "Participer" },
    { to: "/prize-list", label: "Palmarès" },
  ];

  const DesktopNav = () => (
    <header className="hidden md:flex w-screen bg-white text-black items-center px-8 py-2">
      <div className="flex items-center">
        <NavLink to="/">
          <img src={logoClair} alt="Logo MarsAI" className="h-[70px] w-auto" />
        </NavLink>
      </div>

      <nav className="flex flex-1 justify-center gap-8 text-[20px]">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              isActive
                ? "text-black font-bold underline"
                : "text-black hover:underline"
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex gap-5 mr-10 items-center">
        <img src={logoPlateforme} alt="logo La Plateforme 2024" className="h-6 w-auto" />
        <img src={mobileFilmLogo} alt="Mobile Film Logo" className="h-6 w-auto" />
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-2 text-black"
        >
          <span className="text-xl">{lang}</span>
          <span className="inline-block w-0 h-0 border-l-[7px] border-r-[7px] border-l-transparent border-r-transparent border-t-[10px] border-t-black" />
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-2 bg-white border shadow-md rounded">
            {["FR", "EN"].map((language) => (
              <button
                type="button"
                key={language}
                onClick={() => {
                  setLang(language);
                  setLangOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                {language}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );

  const MobileHeaderBar = () => (
    <header className="md:hidden w-screen bg-white text-black flex items-center justify-between px-4 py-2">
      <NavLink to="/" className="shrink-0">
        <img
          src={logoClair}
          alt="Logo MarsAI"
          className="h-10 w-auto"
          draggable="false"
        />
      </NavLink>

      <div className="flex items-center gap-3">
        <img
          src={logoPlateforme}
          alt="logo La Plateforme 2024"
          className="h-4 w-auto"
          draggable="false"
        />
        <img
          src={mobileFilmLogo}
          alt="Mobile Film Logo"
          className="h-4 w-auto"
          draggable="false"
        />
      </div>

      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
        className="shrink-0 p-2"
      >
        <span className="block w-6 h-[2px] bg-black mb-1" />
        <span className="block w-6 h-[2px] bg-black mb-1" />
        <span className="block w-6 h-[2px] bg-black" />
      </button>
    </header>
  );

  const MobileMenuOverlay = () => {
    if (!menuOpen) return null;

        return (
            <div className="md:hidden fixed inset-0 z-50 bg-[#262335] text-white">
            <div className="w-full flex items-start justify-between px-4 pt-4">
                <div className="flex items-start gap-3">
                <NavLink to="/" onClick={() => setMenuOpen(false)} className="shrink-0">
                    <img
                    src={logoSombre}
                    alt="Logo MarsAI"
                    className="h-10 w-auto"
                    draggable="false"
                    />
                </NavLink>

                <div className="flex items-center gap-3 pt-1">
                    <img
                    src={logoPlateforme}
                    alt="logo La Plateforme 2024"
                    className="h-4 w-auto"
                    draggable="false"
                    />
                    <img
                    src={mobileFilmLogo}
                    alt="Mobile Film Logo"
                    className="h-4 w-auto"
                    draggable="false"
                    />
                </div>
                </div>

                <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="p-2"
                >
                <span className="relative block w-8 h-8">
                    <span className="absolute left-0 top-1/2 w-8 h-[2px] bg-white rotate-45 -translate-y-1/2" />
                    <span className="absolute left-0 top-1/2 w-8 h-[2px] bg-white -rotate-45 -translate-y-1/2" />
                </span>
                </button>
            </div>

            <nav className="h-[calc(100%-72px)] flex flex-col items-center justify-center px-8">
                <ul className="w-full max-w-sm text-center">
                {links.map((l, idx) => (
                    <li key={l.to} className="w-full">
                    <NavLink
                        to={l.to}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                        [
                            "block py-7 text-[34px] leading-none font-light",
                            "transition-colors",
                            "text-white",
                            isActive ? "opacity-100" : "opacity-95",
                        ].join(" ")
                        }
                    >
                        {l.label}
                    </NavLink>

                    {idx !== links.length - 1 && (
                        <div className="mx-auto w-full h-px bg-white/45" />
                    )}
                    </li>
                ))}
                </ul>

                <div className="absolute bottom-5 right-5">
                <div className="relative">
                    <button
                    type="button"
                    onClick={() => setLangOpen((v) => !v)}
                    className="flex items-center gap-2 text-white text-base"
                    >
                    <span className="font-medium tracking-wide">{lang}</span>
                    <span className="inline-block w-0 h-0 border-l-[6px] border-r-[6px] border-l-transparent border-r-transparent border-t-[8px] border-t-white/90" />
                    </button>

                    {langOpen && (
                    <div className="absolute bottom-10 right-0 bg-[#1f1c2e] border border-white/15 rounded shadow-lg overflow-hidden">
                        {["FR", "EN"].map((language) => (
                        <button
                            type="button"
                            key={language}
                            onClick={() => {
                            setLang(language);
                            setLangOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-white/10 text-white"
                        >
                            {language}
                        </button>
                        ))}
                    </div>
                    )}
                </div>
                </div>
            </nav>
            </div>
        );
    };

  return (
    <>
      <DesktopNav />
      <MobileHeaderBar />
      <MobileMenuOverlay />
    </>
  );
}
