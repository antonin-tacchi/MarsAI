export default function PartnerCard({ partner }) {
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="
        block relative overflow-hidden
        bg-white rounded-2xl border-2 border-[#C7C2CE]/30
        p-6 md:p-8
        transition-all duration-300 ease-out
        cursor-pointer
      "
    >
      {/* Conteneur du logo */}
      <div className="flex items-center justify-center min-h-[100px] md:min-h-[120px]">
        <img 
          src={partner.logo} 
          alt={partner.name}
          className="max-w-full max-h-20 md:max-h-24 w-auto h-auto object-contain"
          loading="lazy"
          decoding="async"
          width="200"
          height="80"
        />
      </div>
      
      {/* Nom du partenaire */}
      {partner.name && (
        <div className="text-center border-t border-[#C7C2CE]/30 pt-3 mt-4">
          <h3 className="text-base md:text-lg font-semibold text-[#262335] tracking-tight">
            {partner.name}
          </h3>
        </div>
      )}
    </a>
  );
}