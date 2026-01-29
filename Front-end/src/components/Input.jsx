export default function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  error,
  className = "",
}) {
  const isTextArea = type === "textarea";
  const Tag = isTextArea ? "textarea" : "input";

  return (
    <div className="flex flex-col mb-4 w-full">
      {label && (
        <label className="text-xl font-bold mb-3 text-[#262335] ml-1">
          {label}
        </label>
      )}

      <Tag
        name={name}
        type={!isTextArea ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          p-4 rounded-2xl border-2 transition-all duration-200 outline-none
          bg-[#FBF5F0] text-[#262335] placeholder:text-[#262335]/30
          ${error ? "border-red-500 bg-red-50" : "border-[#262335]/10 focus:border-[#463699] focus:bg-white"}
          ${isTextArea ? "h-32 resize-none" : "h-[54px]"}
          ${className}
        `}
      />

      {error && (
        <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">
          {error}
        </span>
      )}
    </div>
  );
}
