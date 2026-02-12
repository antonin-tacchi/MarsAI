import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useFilmFilters() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    selected: searchParams.get("selected") === "1" ? "selected" : "all",
    country: searchParams.get("country") || "",
    ai: searchParams.get("ai") || "",
  });

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const res = await fetch("/api/films");
        const json = await res.json();
        setFilms(json.data || []);
      } catch (err) {
        console.error("Failed to load films", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const countries = ["France", "USA", "Japan"];

  const aiTools = ["Runway", "Midjourney", "DALL-E"];

  const filteredFilms = useMemo(() => {
    return films.filter((film) => {
      if (filters.selected === "selected" && film.status !== "selected") {
        return false;
      }
      if (filters.country && film.country !== filters.country) {
        return false;
      }
      if (
        filters.ai &&
        !film.ai_tools_used?.toLowerCase().includes(filters.ai.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [films, filters]);

  useEffect(() => {
    const params = {};
    if (filters.selected === "selected") params.selected = "1";
    if (filters.country) params.country = filters.country;
    if (filters.ai) params.ai = filters.ai;
    setSearchParams(params);
  }, [filters, setSearchParams]);

  return {
    loading,
    filters,
    setFilters,
    films: filteredFilms,
    countries,
    aiTools,
  };
}
