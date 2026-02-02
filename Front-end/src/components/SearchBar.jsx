import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-[600px]">
      <MagnifyingGlassIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#262335] opacity-60 pointer-events-none"
      />
      <input
        type="text"
        placeholder="Rechercher un réalisateur, un film..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[#262335] border border-gray-300 bg-[#C7C2CE]
                   rounded-md py-2 pl-10 pr-3
                   focus:outline-none"
      />
    </div>
  );
}
