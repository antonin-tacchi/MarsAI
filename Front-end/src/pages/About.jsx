import { Link } from "react-router-dom";
import image1 from "/src/images/imgregister.png";
import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const sections = [
    {
      title: "Pourquoi MarsAI",
      text: "MarsAI est né du constat que l’intelligence artificielle transforme profondément la création visuelle et le cinéma. Le festival offre une scène internationale aux artistes qui utilisent l’IA comme outil narratif, esthétique ou expérimental.",
      dark: false,
    },
    {
      title: "Une nouvelle génération de cinéma",
      text: "Les œuvres présentées explorent de nouveaux langages visuels issus des technologies génératives. MarsAI valorise les formes émergentes de storytelling où l’algorithme devient un partenaire de création.",
      dark: false,
    },
    {
      title: "Le thème du festival",
      text: "Chaque édition explore les relations entre l’humain et la machine, l’imaginaire et l’algorithme. Les films sélectionnés interrogent notre perception du réel et de l’image à l’ère de la génération automatisée.",
      dark: true,
    },
    {
      title: "Comment fonctionne le festival",
      text: "Les films sont soumis par des créateurs du monde entier. Un comité de présélection évalue les œuvres selon leur qualité artistique, leur originalité et l’intégration de l’IA dans le processus créatif.",
      dark: true,
    },
    {
      title: "Jury & sélection",
      text: "Le jury réunit réalisateurs, artistes numériques, chercheurs en intelligence artificielle et producteurs. Il récompense les œuvres qui repoussent les limites de la création audiovisuelle.",
      dark: false,
    },
    {
      title: "Prix & récompenses",
      text: "Grand Prix MarsAI, Prix de l’innovation visuelle, Prix narration IA, Prix du public et Prix étudiant. Les lauréats bénéficient d’une visibilité internationale et d’un accompagnement à la diffusion.",
      dark: false,
    },
    {
      title: "Un événement à Marseille",
      text: "Marseille, ville de cinéma et de cultures, offre un cadre unique entre patrimoine, mer et innovation. Le festival s’inscrit dans l’écosystème créatif et technologique de la ville.",
      dark: true,
    },
    {
      title: "Organisation & partenaires",
      text: "MarsAI est porté par une équipe réunissant professionnels du cinéma, experts en IA et acteurs culturels. Le festival est soutenu par des institutions, écoles, studios et entreprises engagés dans l’innovation audiovisuelle.",
      dark: true,
    },
  ];

  return (
    <div className="bg-[#FBF5F0]">
      {/* HERO */}
      <section className="bg-[#262335]">
        <div className="max-w-6xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8 leading-tight">
              Festival international du cinéma créé avec l’IA
            </h1>

            <p className="text-white/80 text-lg leading-relaxed max-w-xl">
              MarsAI célèbre une nouvelle génération de cinéastes qui explorent
              les frontières entre créativité humaine et intelligence
              artificielle.
            </p>
          </div>

          <div className="rounded-[28px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.35)]">
            <img
              src= {image1}
              alt="MarsAI Festival"
              className="w-full h-[460px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-y border-[#eee]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div>
            <p className="text-4xl font-bold text-[#463699]">3000</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              VISITEURS ATTENDUS
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+60</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              PROFESSIONNELS
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+120</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              FILMS PROJETÉS
            </p>
          </div>

          <div>
            <p className="text-4xl font-bold text-[#463699]">+600</p>
            <p className="text-[#262335]/70 mt-3 text-sm tracking-wide">
              FILMS SOUMIS
            </p>
          </div>
        </div>
      </section>

      {/* 8 SECTIONS FIDÈLES */}
      {sections.map((s, i) => (
        <section key={i} className={s.dark ? "bg-[#262335]" : "bg-[#FBF5F0]"}>
          <div className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16">
            <h3
              className={`text-2xl font-semibold ${
                s.dark ? "text-white" : "text-[#262335]"
              }`}
            >
              {s.title}
            </h3>

            <p
              className={`text-lg leading-relaxed ${
                s.dark ? "text-white/70" : "text-[#262335]/70"
              }`}
            >
              {s.text}
            </p>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="bg-[#FBF5F0]">
        <div className="max-w-5xl mx-auto px-6 py-24 flex flex-wrap gap-5 justify-center">
          <Link
            to="/submissions"
            className="bg-[#262335] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
          >
            {t("about.submitFilm")}
          </Link>

          <button className="border border-[#262335] text-[#262335] px-8 py-4 rounded-xl font-semibold hover:bg-[#262335] hover:text-white transition">
            {t("about.newsletter")}
          </button>

          <Link
            to="/regulation"
            className="border border-[#262335] text-[#262335] px-8 py-4 rounded-xl font-semibold hover:bg-[#262335] hover:text-white transition"
          >
            {t("about.regulation")}
          </Link>
        </div>
      </section>
    </div>
  );
}