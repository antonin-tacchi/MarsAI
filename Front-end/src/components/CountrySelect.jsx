import { useState, useRef, useEffect } from "react";
import COUNTRIES from "../constants/countries.js";
import { useLanguage } from "../context/LanguageContext";

export default function CountrySelect({ label, name, value, onChange, error }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full" ref={wrapperRef}>
      {label && (
        <label className="text-lg md:text-xl font-bold text-[#262335] mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={open ? search : value}
          placeholder={t("countrySelect.search")}
          onFocus={() => {
            setOpen(true);
            setSearch(value || "");
          }}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          autoComplete="off"
          className={`w-full px-4 py-3 border-2 rounded-2xl bg-white/60 text-[#262335] font-medium focus:outline-none focus:border-[#463699] transition-all ${
            error ? "border-red-500 bg-red-50" : "border-[#262335]/10"
          }`}
        />
        {open && (
          <ul className="absolute z-50 w-full mt-1 max-h-52 overflow-y-auto bg-white border border-[#262335]/10 rounded-2xl shadow-xl">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[#262335]/50 italic">
                {t("countrySelect.noResults")}
              </li>
            ) : (
              filtered.map((c) => (
                <li
                  key={c}
                  onClick={() => {
                    onChange(c);
                    setSearch("");
                    setOpen(false);
                  }}
                  className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-[#463699]/10 transition-colors ${
                    c === value ? "bg-[#463699]/20 font-bold" : ""
                  }`}
                >
                  {c}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">
          {error}
        </span>
      )}
    </div>
  );
}
