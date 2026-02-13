import { useState } from "react";

export default function FilmFilters({ filters, onChange, countries, aiTools, categories, stats }) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggle = (key, value) => {
    onChange((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
    setOpenDropdown(null);
  };

  const baseBtn =
    "px-5 py-2.5 rounded-[26px] font-[Saira] text-sm transition-colors";

  const inactive = "bg-[#FBF5F0] text-[#463699] border border-[#463699] hover:bg-[#463699]/10";
  const active = "bg-[#463699] text-[#FBF5F0] border-0";

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

        <div className="h-6 w-px bg-[#262335]/20"></div>

        {/* Dropdown Catégories */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("categories")}
            className={`${baseBtn} ${filters.category ? active : inactive} flex items-center gap-2`}
          >
            {filters.category || "Catégories"}
            <svg
              className={`w-4 h-4 transition-transform ${openDropdown === "categories" ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {openDropdown === "categories" && (
            <div className="absolute top-full mt-2 bg-white border border-[#463699] rounded-lg shadow-lg min-w-[250px] z-10 max-h-[300px] overflow-y-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggle("category", cat.name)}
                  className="w-full text-left px-4 py-2 text-sm text-[#262335] font-[Saira] hover:bg-[#463699]/10 transition-colors"
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#262335]/20"></div>

        {/* Dropdown Pays */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("pays")}
            className={`${baseBtn} ${filters.country ? active : inactive} flex items-center gap-2`}
          >
            {filters.country || "Pays"}
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
            <div className="absolute top-full mt-2 bg-white border border-[#463699] rounded-lg shadow-lg min-w-[200px] z-10 max-h-[300px] overflow-y-auto">
              {countries.map((country) => {
                const countryData = stats?.byCountry.find(c => c.country === country);
                return (
                  <button
                    key={country}
                    onClick={() => toggle("country", country)}
                    className="w-full text-left px-4 py-2 text-sm text-[#262335] font-[Saira] hover:bg-[#463699]/10 transition-colors"
                  >
                    {country} ({countryData?.count || 0})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#262335]/20"></div>

        {/* Dropdown Outils IA */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown("outils")}
            className={`${baseBtn} ${filters.ai ? active : inactive} flex items-center gap-2`}
          >
            {filters.ai || "Outils IA"}
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
            <div className="absolute top-full mt-2 bg-white border border-[#463699] rounded-lg shadow-lg min-w-[200px] z-10 max-h-[300px] overflow-y-auto">
              {aiTools.map((tool) => {
                const toolData = stats?.byAITool.find(t => t.tool === tool);
                return (
                  <button
                    key={tool}
                    onClick={() => toggle("ai", tool)}
                    className="w-full text-left px-4 py-2 text-sm text-[#262335] font-[Saira] hover:bg-[#463699]/10 transition-colors"
                  >
                    {tool} ({toolData?.count || 0})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}