import { useMemo } from "react";
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

  const countries = useMemo(() => {
    if (Array.isArray(COUNTRIES)) return COUNTRIES;

    if (COUNTRIES?.countries && Array.isArray(COUNTRIES.countries)) return COUNTRIES.countries;

    return [];
  }, []);

  const ph =
    placeholder ||
    t("movieForm.selectCountry") ||
    "Select a country";

  return (
    <div className="flex flex-col w-full">
      <label className="text-lg md:text-xl font-bold text-[#262335] mb-3 ml-1">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-2xl px-4 py-3 font-bold outline-none border-2 transition-all bg-white/70 ${
          error ? "border-red-500" : "border-[#262335]/20 focus:border-[#463699]"
        }`}
      >
        <option value="">{ph}</option>

        {countries.map((c) => {
          const countryName = typeof c === "string" ? c : c?.name;
          const countryValue = typeof c === "string" ? c : (c?.value || c?.name);

          if (!countryName) return null;

          return (
            <option key={countryValue} value={countryValue}>
              {countryName}
            </option>
          );
        })}
      </select>

      {error && (
        <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">
          {error}
        </span>
      )}
    </div>
  );
}
