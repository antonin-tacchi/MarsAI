import { useState, useRef, useEffect } from "react";
import COUNTRIES from "../constants/countries";
import { useLanguage } from "../context/LanguageContext";

export default function CountrySelect({ label, value, onChange, error, name }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value || "");
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setSearch(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        if (!COUNTRIES.includes(search)) {
          setSearch(value || "");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search, value]);

  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country) => {
    setSearch(country);
    setOpen(false);
    if (typeof onChange === "function") {
      onChange(country);
    }
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setSearch(v);
    setOpen(true);

    if (COUNTRIES.includes(v)) {
      onChange(v);
    } else if (value) {
      onChange("");
    }
  };

  return (
    <div className="flex flex-col mb-4 w-full relative" ref={wrapperRef}>
      {label && (
        <label className="text-xl font-bold mb-3 text-[#262335] ml-1">
          {label}
        </label>
      )}

      <input
        name={name}
        type="text"
        autoComplete="off"
        value={search}
        onFocus={() => setOpen(true)}
        onChange={handleInputChange}
        placeholder={t("countrySelect.search")}
        className={`
          p-4 rounded-2xl border-2 transition-all duration-200 outline-none h-[54px]
          bg-[#FBF5F0] text-[#262335] placeholder:text-[#262335]/30
          ${error ? "border-red-500 bg-red-50" : "border-[#262335]/10 focus:border-[#463699] focus:bg-white"}
        `}
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border-2 border-[#262335]/10 rounded-2xl shadow-xl z-50"
        >
          {filtered.map((country) => (
            <li
              key={country}
              onClick={() => handleSelect(country)}
              className={`px-4 py-3 cursor-pointer transition-colors hover:bg-[#463699]/10 text-[#262335] ${
                country === value ? "bg-[#463699]/20 font-bold" : ""
              }`}
            >
              {country}
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && search && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-[#262335]/10 rounded-2xl shadow-xl z-50 px-4 py-3 text-[#262335]/50 italic">
          {t("countrySelect.noResults")}
        </div>
      )}

      {error && (
        <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">
          {error}
        </span>
      )}
    </div>
  );
}
