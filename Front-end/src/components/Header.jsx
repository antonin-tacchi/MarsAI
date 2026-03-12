import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import logoClair from "../images/logo-clair.png";
import logoSombre from "../images/logo-sombre.png";
import logoPlateforme from "../images/logo-laplateforme-2024.png";
import mobileFilmLogo from "../images/mobile-film-logo.png";

export default function Header() {
  const location = useLocation();
  const { lang, changeLang, t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const displayLang = lang.toUpperCase();

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/about",       label: t("header.festival") },
    { to: "/catalogs",    label: t("header.catalog") },
    { to: "/submissions", label: t("header.participate") },
    { to: "/prize-list",  label: t("header.prizes") },
  ];

  const handleLangChange = (language) => {
    changeLang(language.toLowerCase());
    setLangOpen(false);
  };

  const DesktopNav = () => (
    <header
      className={`hidden md:flex w-screen items-center px-10 py-0 relative z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#C9A84C]/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          : "bg-[#0A0A0F] border-b border-[#C9A84C]/10"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center py-3">
        <NavLink to="/" className="flex items-center">
          <img src={logoSombre} alt="Logo MarsAI" className="h-[58px] w-auto" />
        </NavLink>
      </div>

      {/* Gold separator */}
      <div className="w-px h-8 bg-[#C9A84C]/20 mx-8" />

      {/* Nav links */}
      <nav className="flex flex-1 justify-center gap-10">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              [
                "relative py-7 text-[13px] font-semibold tracking-[0.18em] uppercase transition-colors duration-200",
                "after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px]",
                "after:transition-transform after:duration-300 after:origin-center",
                isActive
                  ? "text-[#C9A84C] after:bg-[#C9A84C] after:scale-x-100"
                  : "text-[#C8C0B0] hover:text-[#E8C97A] after:bg-[#C9A84C] after:scale-x-0 hover:after:scale-x-100",
              ].join(" ")
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Partner logos */}
      <div className="flex gap-4 mr-8 items-center opacity-70">
        <img src={logoPlateforme} alt="La Plateforme 2024" className="h-5 w-auto filter brightness-0 invert" />
        <div className="w-px h-4 bg-[#C9A84C]/30" />
        <img src={mobileFilmLogo} alt="Mobile Film Logo" className="h-5 w-auto filter brightness-0 invert" />
      </div>

      {/* Language selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-2 text-[#C8C0B0] hover:text-[#C9A84C] transition-colors duration-200 text-[12px] font-semibold tracking-[0.2em] uppercase py-2 px-3 border border-[#C9A84C]/20 rounded hover:border-[#C9A84C]/50"
        >
          <span>{displayLang}</span>
          <svg className="w-2.5 h-2.5" viewBox="0 0 10 6" fill="currentColor">
            <path d="M0 0l5 6 5-6z" />
          </svg>
        </button>

        {langOpen && (
          <div className="absolute right-0 mt-1 bg-[#12121A] border border-[#C9A84C]/25 rounded shadow-[0_8px_24px_rgba(0,0,0,0.6)] overflow-hidden z-50 min-w-[80px]">
            {["FR", "EN"].map((language) => (
              <button
                type="button"
                key={language}
                onClick={() => handleLangChange(language)}
                className="block w-full text-left px-4 py-2.5 text-[12px] font-semibold tracking-[0.15em] uppercase text-[#C8C0B0] hover:text-[#C9A84C] hover:bg-[#C9A84C]/8 transition-colors"
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
    <header className={`md:hidden w-screen flex items-center justify-between px-5 py-3 relative z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0A0A0F]/95 backdrop-blur-md border-b border-[#C9A84C]/20" : "bg-[#0A0A0F] border-b border-[#C9A84C]/10"
    }`}>
      <NavLink to="/" className="shrink-0">
        <img src={logoSombre} alt="Logo MarsAI" className="h-9 w-auto" draggable="false" />
      </NavLink>

      <div className="flex items-center gap-3">
        <img src={logoPlateforme} alt="La Plateforme 2024" className="h-4 w-auto opacity-60 filter brightness-0 invert" draggable="false" />
        <div className="w-px h-3.5 bg-[#C9A84C]/25" />
        <img src={mobileFilmLogo} alt="Mobile Film Logo" className="h-4 w-auto opacity-60 filter brightness-0 invert" draggable="false" />
      </div>

      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
        className="shrink-0 p-2 flex flex-col gap-1.5"
      >
        <span className="block w-6 h-[1.5px] bg-[#C9A84C]" />
        <span className="block w-4 h-[1.5px] bg-[#C9A84C] self-end" />
        <span className="block w-6 h-[1.5px] bg-[#C9A84C]" />
      </button>
    </header>
  );

  const MobileMenuOverlay = () => {
    if (!menuOpen) return null;

    return (
      <div className="md:hidden fixed inset-0 z-50 bg-[#0A0A0F]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C9A84C]/15">
          <NavLink to="/" onClick={() => setMenuOpen(false)} className="shrink-0">
            <img src={logoSombre} alt="Logo MarsAI" className="h-9 w-auto" draggable="false" />
          </NavLink>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="p-2 text-[#C8C0B0] hover:text-[#C9A84C] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gold thin accent line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        {/* Navigation */}
        <nav className="h-[calc(100%-65px)] flex flex-col items-center justify-center px-8">
          <ul className="w-full max-w-sm">
            {links.map((l, idx) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "block py-6 text-[28px] font-display font-bold text-center tracking-wide transition-colors duration-200",
                      isActive ? "text-[#C9A84C]" : "text-[#F5F0E8] hover:text-[#C9A84C]",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>

                {idx !== links.length - 1 && (
                  <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />
                )}
              </li>
            ))}
          </ul>

          {/* Bottom lang & partner logos */}
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-between px-8">
            <div className="flex items-center gap-4 opacity-50">
              <img src={logoPlateforme} alt="La Plateforme" className="h-4 filter brightness-0 invert" />
              <div className="w-px h-3.5 bg-[#C9A84C]/40" />
              <img src={mobileFilmLogo} alt="Mobile Film Logo" className="h-4 filter brightness-0 invert" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                className="flex items-center gap-2 text-[#C8C0B0] hover:text-[#C9A84C] text-[12px] font-semibold tracking-[0.2em] uppercase border border-[#C9A84C]/25 px-3 py-1.5 rounded transition-colors"
              >
                <span>{displayLang}</span>
                <svg className="w-2 h-2" viewBox="0 0 10 6" fill="currentColor">
                  <path d="M0 0l5 6 5-6z" />
                </svg>
              </button>

              {langOpen && (
                <div className="absolute bottom-10 right-0 bg-[#12121A] border border-[#C9A84C]/25 rounded shadow-lg overflow-hidden">
                  {["FR", "EN"].map((language) => (
                    <button
                      type="button"
                      key={language}
                      onClick={() => handleLangChange(language)}
                      className="block w-full text-left px-4 py-2.5 text-[12px] font-semibold tracking-[0.15em] uppercase text-[#C8C0B0] hover:text-[#C9A84C] hover:bg-[#C9A84C]/8 transition-colors"
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
