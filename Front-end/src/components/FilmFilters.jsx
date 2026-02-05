import { useState } from "react";

export default function FilmFilters({ filters, onChange, countries, aiTools }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggle = (key, value) => {
    onChange((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  const baseBtn =
    "px-5 py-2.5 rounded-[26px] font-[Saira] text-sm transition-colors";

  const inactive = "bg-[#FBF5F0] text-[#463699] border border-[#463699] hover:bg-[#463699]/10";
  const active = "bg-[#463699] text-[#FBF5F0] border-0";

  // Exemples de données
  const exampleCountries = countries.length > 0 ? countries : ["Brésil", "Madrid", "Inde"];
  const exampleAiTools = aiTools.length > 0 ? aiTools : ["ChatGPT", "Midjourney", "Stable Diffusion"];

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="w-full bg-[#FBF5F0] p-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Films sélectionnés */}
        <button
          onClick={() => toggle("selected", "selected")}
          className={`${baseBtn} ${filters.selected === "selected" ? active : inactive}`}
        >
          Films sélectionnés
        </button>

        {/* Séparateur visuel */}
        <div className="h-6 w-px bg-[#262335]/20"></div>

        {/* Dropdown Pays */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("pays")}
            className={`${baseBtn} ${inactive} flex items-center gap-2`}
            disabled={countries.length === 0}
          >
            Pays
            <svg
              className={`w-4 h-4 transition-transform ${openDropdown === "pays" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === "pays" && (
            <div className="absolute top-full mt-2 bg-white border border-[#463699] rounded-lg shadow-lg min-w-[200px] z-10">
              {exampleCountries.map((country) => (
                <div
                  key={country}
                  className="px-4 py-2 text-sm text-[#262335]/60 font-[Saira] cursor-not-allowed hover:bg-gray-50"
                >
                  {country}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Séparateur visuel */}
        <div className="h-6 w-px bg-[#262335]/20"></div>

        {/* Dropdown Outils IA */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("outils")}
            className={`${baseBtn} ${inactive} flex items-center gap-2`}
            disabled={aiTools.length === 0}
          >
            Outils IA
            <svg
              className={`w-4 h-4 transition-transform ${openDropdown === "outils" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === "outils" && (
            <div className="absolute top-full mt-2 bg-white border border-[#463699] rounded-lg shadow-lg min-w-[200px] z-10">
              {exampleAiTools.map((tool) => (
                <div
                  key={tool}
                  className="px-4 py-2 text-sm text-[#262335]/60 font-[Saira] cursor-not-allowed hover:bg-gray-50"
                >
                  {tool}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}