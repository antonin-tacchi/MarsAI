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
        <label className="text-[11px] font-bold mb-2.5 text-[#C8C0B0] tracking-[0.2em] uppercase ml-1">
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
          p-4 rounded border-2 bg-[#12121A] text-[#F5F0E8]
          placeholder:text-[#C8C0B0]/30
          transition-all duration-200 outline-none
          ${error
            ? "border-[#8B1A2E] bg-[#8B1A2E]/10 focus:border-[#B02240]"
            : "border-[#C9A84C]/15 focus:border-[#C9A84C]/60 focus:bg-[#1E1E2E] focus:shadow-[0_0_12px_rgba(201,168,76,0.1)]"
          }
          ${isTextArea ? "h-32 resize-none" : "h-[52px]"}
          ${className}
        `}
      />

      {error && (
        <span className="text-[#B02240] text-[10px] mt-1.5 ml-1 font-semibold tracking-wide italic">
          {error}
        </span>
      )}
    </div>
  );
}
