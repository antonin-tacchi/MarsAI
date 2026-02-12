export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-20 py-3 rounded-lg font-medium tracking-wide
        bg-[#262335] text-white
        hover:bg-[#322e47] 
        hover:shadow-xl
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 ease-in-out
        ${className}
      `}
    >
      {children}
    </button>
  );
}
