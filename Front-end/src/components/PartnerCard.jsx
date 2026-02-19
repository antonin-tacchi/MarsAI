export default function PartnerCard({ 
  partner, 
  isAdmin = false, 
  onEdit, 
  isDragging = false 
}) {
  const handleClick = (e) => {
    if (isAdmin) {
      e.preventDefault();
      onEdit?.(partner);
    }
  };

  return (
    <a
      href={!isAdmin ? partner.url : undefined}
      target={!isAdmin ? "_blank" : undefined}
      rel={!isAdmin ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      className={`
        block relative overflow-hidden
        bg-white rounded-2xl border-2 border-[#C7C2CE]/30
        p-6 md:p-8
        transition-all duration-300 ease-out
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isAdmin ? 'cursor-move' : 'cursor-pointer'}
      `}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 h-full">
        {/* Logo container - Moins haut, centré */}
        <div className="flex-1 flex items-center justify-center min-h-[100px] md:min-h-[120px]">
          <img 
            src={partner.logo} 
            alt={partner.name}
            className="max-w-full max-h-20 md:max-h-24 w-auto h-auto object-contain"
            loading="lazy"
          />
        </div>
        
        {/* Partner info */}
        {(partner.name || partner.subtitle) && (
          <div className="text-center border-t border-[#C7C2CE]/30 pt-3">
            {partner.name && (
              <h3 className="text-base md:text-lg font-semibold text-[#262335] mb-1 tracking-tight">
                {partner.name}
              </h3>
            )}
            {partner.subtitle && (
              <p className="text-sm text-[#262335]/60 leading-snug">
                {partner.subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Admin overlay */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-[#463699] text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <span className="text-base">✏️</span>
        </div>
      )}
    </a>
  );
}