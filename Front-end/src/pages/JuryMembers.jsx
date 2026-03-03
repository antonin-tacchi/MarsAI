import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// --- SKELETON CARD ---
const SkeletonJuryCard = () => (
  <div className="w-full rounded-2xl overflow-hidden bg-white shadow-lg">
    <div className="w-full h-[240px] md:h-[280px] lg:h-[300px] animate-shimmer" />
    <div className="p-5 bg-[#262335]">
      <div className="h-3 animate-shimmer rounded w-1/3 mb-2" />
      <div className="h-5 animate-shimmer rounded w-3/4 mb-2" />
      <div className="h-4 animate-shimmer rounded w-full mb-2" />
      <div className="h-4 animate-shimmer rounded w-2/3" />
    </div>
  </div>
);

export default function Jury() {
  const { t } = useLanguage();
  const [juryMembers, setJuryMembers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJuryMembers = async () => {
      setStatus("loading");
      setError("");

      try {
        const res = await fetch(`${API_URL}/api/jury-members`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || t("jury.loadError") || "Erreur de chargement");
        }

        setJuryMembers(data?.data || []);
        setStatus("idle");
      } catch (err) {
        console.error("Erreur fetch jury members:", err);
        setError(t("jury.connectionError") || "Erreur de connexion au serveur");
        setStatus("idle");
      }
    };

    fetchJuryMembers();
  }, [t]);

  const defaultColors = ["#8B7EC8", "#7A9B8E", "#2C2C2C", "#D4A373", "#5C6BC0", "#8D6E63"];

  return (
    <main className="min-h-screen bg-[#FBF5F0] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <header className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#262335] uppercase tracking-tighter leading-tight mb-4 px-4 italic">
            {t("jury.title") || "LES MEMBRES"}
            <br />
            <span className="text-[#2563EB]">
              {t("jury.titleHighlight") || "DU JURY"}
            </span>
          </h1>
          <p className="text-base md:text-lg text-[#262335]/70 leading-relaxed max-w-3xl px-4">
            {t("jury.subtitle") || 
              "Experts IA, cinéastes et visionnaires réunis pour délibérer sur la sélection officielle."}
          </p>
        </header>

        {/* --- ERREUR --- */}
        {error && (
          <div className="flex flex-col items-center justify-center p-10 bg-red-50 border-2 border-red-100 rounded-[2.5rem] text-center max-w-2xl mx-auto mb-12">
            <div className="text-5xl mb-4 text-red-400">⚠️</div>
            <h2 className="text-2xl font-black text-[#262335] uppercase mb-2">
              {t("jury.serverError") || "Erreur serveur"}
            </h2>
            <p className="text-[#262335]/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-[#262335] text-white font-bold rounded-full hover:bg-[#262335]/90 transition-all"
            >
              {t("jury.retry") || "Réessayer"}
            </button>
          </div>
        )}

        {/* --- LOADING --- */}
        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonJuryCard key={i} />
            ))}
          </div>
        )}

        {/* --- EMPTY --- */}
        {status === "idle" && !error && juryMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-[#262335]/10 rounded-[2.5rem] bg-[#FBF5F0]/50">
            <div className="text-6xl mb-6 opacity-30">👥</div>
            <h2 className="text-2xl md:text-3xl font-black text-[#262335] uppercase tracking-tighter">
              {t("jury.empty") || "Aucun membre du jury pour le moment"}
            </h2>
          </div>
        )}

        {/* --- GRID --- */}
        {status === "idle" && juryMembers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {juryMembers.map((member, index) => {
              const bgColor = member.color || defaultColors[index % defaultColors.length];
              
              return (
                <article
                  key={member.id}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-3"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* IMAGE */}
                  <div
                    className="relative w-full h-[240px] md:h-[280px] lg:h-[300px] flex-shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    {member.image_url ? (
                      <img
                        src={`${API_URL}${member.image_url}`}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const fallback = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='${encodeURIComponent(bgColor)}' width='400' height='400'/%3E%3Ctext fill='%23fff' font-family='Arial, sans-serif' font-size='72' font-weight='bold' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3E${member.name.charAt(0)}%3C/text%3E%3C/svg%3E`;
                          e.target.src = fallback;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-7xl font-black">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-5 bg-[#262335] text-white flex-grow flex flex-col">
                    <span className="text-xs font-bold tracking-wider uppercase text-[#FF6B35] mb-2 block">
                      {member.role || t("jury.undefined")}
                    </span>
                    <h2 className="text-xl md:text-[1.4rem] font-black uppercase tracking-tight mb-2 leading-tight">
                      {member.name}
                    </h2>
                    {member.description && (
                      <p className="text-sm md:text-base leading-relaxed text-white/85">
                        {member.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-color: rgba(38, 35, 53, 0.05);
          }
          50% {
            background-color: rgba(38, 35, 53, 0.15);
          }
          100% {
            background-color: rgba(38, 35, 53, 0.05);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}