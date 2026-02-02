export default function FilmFilters({ filters, onChange, countries, aiTools }) {
  const handleChange = (key, value) => {
    onChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="film-filters">
      {/* Films sélectionnés */}
      <label>
        Films
        <select
          value={filters.selected}
          onChange={(e) => handleChange("selected", e.target.value)}
        >
          <option value="all">Tous les films</option>
          <option value="selected">Films sélectionnés</option>
        </select>
      </label>

      {/* Pays */}
      <label>
        Pays
        <select
          value={filters.country}
          onChange={(e) => handleChange("country", e.target.value)}
        >
          <option value="">Tous les pays</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      {/* Outils IA */}
      <label>
        Outils IA
        <select
          value={filters.ai}
          onChange={(e) => handleChange("ai", e.target.value)}
        >
          <option value="">Tous les outils</option>
          {aiTools.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
