import { useState, useRef, useEffect, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import COUNTRIES from "../constants/countries";

export default function CountrySelect({
  label,
  name = "country",
  value,
  onChange,
  error,
  placeholder,
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const countries = useMemo(() => {
    if (Array.isArray(COUNTRIES)) return COUNTRIES;
    if (COUNTRIES?.countries && Array.isArray(COUNTRIES.countries)) return COUNTRIES.countries;
    return [];
  }, []);

  const ph = placeholder || t("movieForm.selectCountry") || "Sélectionner un pays";

  const normalized = useMemo(() =>
    countries.map((c) => ({
      name: typeof c === "string" ? c : c?.name,
      value: typeof c === "string" ? c : (c?.value || c?.name),
    })).filter((c) => c.name),
  [countries]);

  const filtered = useMemo(() =>
    search.trim()
      ? normalized.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      : normalized,
  [normalized, search]);

  const selectedLabel = normalized.find((c) => c.value === value)?.name || "";

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (val) => {
    onChange({ target: { name, value: val } });
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      {label && (
        <label className="text-[11px] font-bold mb-2 text-[#C8C0B0] tracking-[0.2em] uppercase">
          {label}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full px-4 py-3.5 bg-[#12121A] border-2 rounded text-left flex items-center justify-between transition-all duration-200 outline-none
          ${error
            ? "border-[#8B1A2E] bg-[#8B1A2E]/8"
            : open
            ? "border-[#C9A84C]/60 shadow-[0_0_12px_rgba(201,168,76,0.1)]"
            : "border-[#C9A84C]/15 hover:border-[#C9A84C]/35"}`}
      >
        <span className={`text-sm ${selectedLabel ? "text-[#F5F0E8]" : "text-[#C8C0B0]/30"}`}>
          {selectedLabel || ph}
        </span>
        <svg
          className={`w-4 h-4 text-[#C9A84C]/60 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown — always below */}
      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 right-0 bg-[#12121A] border border-[#C9A84C]/20 rounded shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-[#C9A84C]/10">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C9A84C]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full bg-[#0A0A0F] border border-[#C9A84C]/15 rounded px-3 py-2 pl-8 text-[12px] text-[#F5F0E8] placeholder:text-[#C8C0B0]/30 outline-none focus:border-[#C9A84C]/40"
                />
              </div>
            </div>
            {/* Options list */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-4 py-3 text-[12px] text-[#C8C0B0]/40 text-center">Aucun résultat</p>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => select(c.value)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors
                      ${c.value === value
                        ? "bg-[#C9A84C]/15 text-[#C9A84C] font-semibold"
                        : "text-[#C8C0B0] hover:bg-[#C9A84C]/8 hover:text-[#F5F0E8]"}`}
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <span className="text-[#B02240] text-[10px] mt-1.5 font-semibold italic">{error}</span>
      )}
    </div>
  );
}
