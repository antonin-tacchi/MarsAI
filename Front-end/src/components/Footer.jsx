import {
  FaXTwitter,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaArrowUp,
} from "react-icons/fa6";
import { getProfileRoute } from "../utils/roles";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const profile = getProfileRoute();
  const espaceLink = profile
    ? { label: t(profile.labelKey), href: profile.path }
    : { label: t("footer.login"), href: "/login" };

  return (
    <footer className="relative w-full bg-[#0A0A0F] text-[#F5F0E8]">
      {/* Top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      <div className="mx-auto max-w-6xl px-6 pt-14 pb-10">
        {/* Festival name — center top */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">
            Festival International
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#F5F0E8] tracking-wide">
            Mars<span className="text-[#C9A84C]">AI</span>
          </h2>
          <div className="mt-3 w-16 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
        </div>

        {/* Three columns */}
        <div className="grid gap-10 md:grid-cols-3 md:items-start relative">
          {/* Column 1 */}
          <div className="flex flex-col items-center">
            <h3 className="mb-1 text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C]">
              {t("footer.theFestival")}
            </h3>
            <div className="w-8 h-px bg-[#C9A84C]/40 mb-5" />

            <nav className="flex flex-col items-center space-y-2.5">
              {[
                { label: t("footer.festival"),     href: "/about" },
                { label: t("footer.catalog"),      href: "/catalogs" },
                { label: t("footer.participate"),  href: "/submissions" },
                { label: espaceLink.label,         href: espaceLink.href },
                { label: t("footer.juryMembers"),  href: "/membres-du-jury" },
                { label: t("footer.partners"),     href: "/nos-partenaires" },
                { label: t("footer.prizes"),       href: "/prize-list" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[14px] text-[#C8C0B0] transition-colors duration-200 hover:text-[#C9A84C] tracking-wide"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Vertical separators */}
          <div className="pointer-events-none hidden md:block absolute inset-0">
            <div className="absolute left-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#C9A84C]/20 to-transparent" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-[#C9A84C]/20 to-transparent" />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col items-center text-center">
            <h3 className="mb-1 text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C]">
              {t("footer.usefulLinks")}
            </h3>
            <div className="w-8 h-px bg-[#C9A84C]/40 mb-5" />

            <nav className="flex flex-col items-center space-y-2.5">
              {[
                { label: t("footer.personalData"), href: "/privacy" },
                { label: t("footer.cookies"),      href: "/cookies" },
                { label: t("footer.legal"),        href: "/legal" },
                { label: t("footer.regulation"),   href: "/regulation" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[14px] text-[#C8C0B0] transition-colors duration-200 hover:text-[#C9A84C] tracking-wide"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col items-center text-center">
            <h3 className="mb-1 text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C]">
              {t("footer.communication")}
            </h3>
            <div className="w-8 h-px bg-[#C9A84C]/40 mb-5" />

            <div className="flex flex-col items-center space-y-2.5 mb-7">
              <a href="/contact" className="text-[14px] text-[#C8C0B0] hover:text-[#C9A84C] transition-colors tracking-wide">
                {t("footer.contact")}
              </a>
              <a href="/contact" className="text-[14px] text-[#C8C0B0] hover:text-[#C9A84C] transition-colors tracking-wide">
                Newsletter
              </a>
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center gap-3">
              {[
                { href: "#", label: "X",         icon: <FaXTwitter /> },
                { href: "#", label: "YouTube",   icon: <FaYoutube /> },
                { href: "#", label: "Facebook",  icon: <FaFacebookF /> },
                { href: "#", label: "Instagram", icon: <FaInstagram /> },
                { href: "#", label: "WhatsApp",  icon: <FaWhatsapp /> },
                { href: "#", label: "LinkedIn",  icon: <FaLinkedinIn /> },
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 grid place-items-center rounded-full border border-[#C9A84C]/25 text-[#C8C0B0] hover:border-[#C9A84C] hover:text-[#C9A84C] hover:shadow-[0_0_12px_rgba(201,168,76,0.25)] transition-all duration-200 text-base"
                  target="_blank"
                  rel="noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#C9A84C]/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#C8C0B0]/50 tracking-wide">
            © {new Date().getFullYear()} Festival MarsAI — Tous droits réservés
          </p>
          <p className="text-[11px] text-[#C9A84C]/50 tracking-[0.15em] uppercase font-semibold">
            Le cinéma à l'ère de l'intelligence artificielle
          </p>
        </div>
      </div>

      {/* Back to top */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Retour en haut"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#0A0A0F] text-[#C9A84C] hover:border-[#C9A84C] hover:shadow-[0_0_16px_rgba(201,168,76,0.35)] transition-all duration-300 hover:scale-105"
      >
        <FaArrowUp className="text-sm" />
      </button>
    </footer>
  );
}
