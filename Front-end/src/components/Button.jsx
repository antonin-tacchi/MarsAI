export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-10 py-3 rounded text-[12px] font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    // Gold — main CTA
    primary:
      "bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] hover:scale-[1.02]",
    // Dark with gold border
    secondary:
      "bg-transparent border border-[#C9A84C]/50 text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/8 hover:shadow-[0_0_16px_rgba(201,168,76,0.2)]",
    // Cream / light
    ghost:
      "bg-transparent border border-[#F5F0E8]/20 text-[#F5F0E8] hover:border-[#F5F0E8]/50 hover:bg-[#F5F0E8]/5",
    // Danger
    danger:
      "bg-[#8B1A2E] text-[#F5F0E8] border border-[#8B1A2E] hover:bg-[#B02240] hover:shadow-[0_4px_16px_rgba(139,26,46,0.4)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
