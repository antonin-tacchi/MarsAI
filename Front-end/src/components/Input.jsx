export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  className = "",
}) {
  return (
    <div className="flex flex-col mb-4 w-full">
      {label && (
        <label className="text-sm font-semibold mb-1.5 text-[#262335] ml-1">
          {label}
        </label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          p-3 rounded-lg border-2 border-[#262335]/10 
          bg-[#FBF5F0] text-[#262335] outline-none
          focus:border-[#262335] 
          focus:bg-white 
          transition-all duration-200
          placeholder:text-gray-400
          ${className}
        `}
      />
    </div>
  );
}
