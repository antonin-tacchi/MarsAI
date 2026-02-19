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
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const profile = getProfileRoute();
  const espaceLink = profile
    ? { label: profile.label, href: profile.path }
    : { label: t("footer.login"), href: "/login" };

  return (
    <footer className="relative w-full bg-[#262335] text-white">
    <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-3 md:items-start">
            <div className="flex flex-col items-center">
                <h3 className="mb-6 text-3xl font-semibold tracking-[0.2em] text-white/80">
                    {t("footer.theFestival")}
                </h3>

                <nav className="flex flex-col items-center space-y-2 text-lg leading-7">
                    {[
                    { label: t("footer.festival"), href: "/about" },
                    { label: t("footer.catalog"), href: "/catalogs" },
                    { label: t("footer.participate"), href: "/submissions" },
                    espaceLink,
                    { label: t("footer.juryMembers"), href: "/jury" },
                    { label: t("footer.prizes"), href: "/prize-list" },
                    ].map((l) => (
                    <a
                        key={l.label}
                        href={l.href}
                        className="text-center text-white/90 transition hover:text-white"
                    >
                        {l.label}
                    </a>
                    ))}
                </nav>
                </div>


            <div className="text-center md:text-center">
                <h3 className="mb-6 text-3xl font-semibold tracking-[0.2em] text-white/80">
                    {t("footer.usefulLinks")}
                </h3>

                <nav className="space-y-1 text-lg leading-7">
                    {[
                    { label: t("footer.personalData"), href: "/privacy" },
                    { label: t("footer.cookies"), href: "/cookies" },
                    { label: t("footer.legal"), href: "/legal" },
                    { label: t("footer.regulation"), href: "/regulation" },
                    ].map((l) => (
                    <a
                        key={l.label}
                        href={l.href}
                        className="block text-white/90 transition hover:text-white"
                    >
                        {l.label}
                    </a>
                    ))}
                </nav>
            </div>

            <div className="flex flex-col items-center text-center">
                <h3 className="mb-6 text-3xl font-semibold tracking-[0.2em] text-white/80">
                    {t("footer.communication")}
                </h3>

                <a
                    href="/contact"
                    className="mb-6 text-lg text-white/90 transition hover:text-white"
                >
                    {t("footer.contact")}
                </a>

                <div className="flex items-center justify-center gap-4">
                    <SocialIcon href="#" label="X">
                    <FaXTwitter />
                    </SocialIcon>
                    <SocialIcon href="#" label="YouTube">
                    <FaYoutube />
                    </SocialIcon>
                    <SocialIcon href="#" label="Facebook">
                    <FaFacebookF />
                    </SocialIcon>
                    <SocialIcon href="#" label="Instagram">
                    <FaInstagram />
                    </SocialIcon>
                    <SocialIcon href="#" label="WhatsApp">
                    <FaWhatsapp />
                    </SocialIcon>
                    <SocialIcon href="#" label="LinkedIn">
                    <FaLinkedinIn />
                    </SocialIcon>
                </div>
            </div>
        </div>

        <div className="pointer-events-none relative hidden md:block">
            <div className="absolute left-1/3 top-0 h-full w-px bg-white/35" />
            <div className="absolute left-2/3 top-0 h-full w-px bg-white/35" />
        </div>

        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/90 bg-[#262335] text-white/90 transition hover:scale-105 hover:text-white pointer-events-auto"
            >
            <FaArrowUp className="text-2xl leading-none" />
        </button>
    </div>
    </footer>
  );
}

function SocialIcon({ href, label, children }) {
    return (
        <a
            href={href}
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#262335] transition hover:scale-105"
            target="_blank"
            rel="noreferrer"
        >
            <span className="text-lg">{children}</span>
        </a>
    );
}
