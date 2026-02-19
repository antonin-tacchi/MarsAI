import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PartnerCard from '../components/PartnerCard';

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners');
        const data = await response.json();
        setPartners(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching partners:', error);
        setIsLoading(false);
        
        // Données de démo
        setPartners([
          {
            id: 1,
            name: "Partenaire 1",
            subtitle: "Partenaire Premium",
            logo: "https://via.placeholder.com/200x80/463699/ffffff?text=Logo+1",
            url: "https://example.com",
            order: 1
          },
          {
            id: 2,
            name: "Partenaire 2",
            subtitle: "Partenaire Gold",
            logo: "https://via.placeholder.com/200x80/8A83DA/ffffff?text=Logo+2",
            url: "https://example.com",
            order: 2
          },
          {
            id: 3,
            name: "Partenaire 3",
            subtitle: "Partenaire Silver",
            logo: "https://via.placeholder.com/200x80/C7C2CE/262335?text=Logo+3",
            url: "https://example.com",
            order: 3
          },
          {
            id: 4,
            name: "Partenaire 4",
            logo: "https://via.placeholder.com/200x80/FBD5BD/262335?text=Logo+4",
            url: "https://example.com",
            order: 4
          },
          {
            id: 5,
            name: "Partenaire 5",
            logo: "https://via.placeholder.com/200x80/FBF5F0/262335?text=Logo+5",
            url: "https://example.com",
            order: 5
          }
        ]);
      }
    };

    fetchPartners();
  }, []);

  const handleEditPartner = (partner) => {
    console.log('Edit partner:', partner);
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newPartners = [...partners];
    const draggedPartner = newPartners[draggedItem];
    newPartners.splice(draggedItem, 1);
    newPartners.splice(index, 0, draggedPartner);

    setPartners(newPartners);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    setDraggedItem(null);
    
    try {
      await fetch('/api/partners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: partners.map((p, idx) => ({ id: p.id, order: idx + 1 }))
        })
      });
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C7C2CE] border-t-[#463699] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FBF5F0] to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="absolute top-0 left-0 right-0 h-[400px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8A83DA]/20 via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-5 md:px-8 lg:px-12 xl:px-16 max-w-[1440px] relative z-10">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <h1 className="font-['Saira_Condensed'] text-[36px] md:text-[64px] font-bold text-[#262335] leading-tight tracking-tight">
              Nos Partenaires
            </h1>
            
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#463699] text-white rounded-xl font-semibold text-lg md:text-xl shadow-lg shadow-[#463699]/20 hover:bg-[#8A83DA] transition-all duration-300 whitespace-nowrap"
            >
              <span>Rejoignez-nous</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
          
          <p className="text-base md:text-lg text-[#262335]/70 max-w-2xl leading-relaxed">
            Ils nous font confiance et contribuent à la réussite de notre festival.
            Découvrez les entreprises et organisations qui nous soutiennent.
          </p>
        </div>
      </section>

      {/* Partners Flexbox Grid - 4 colonnes */}
      <section className="pb-24 md:pb-32">
        <div className="container mx-auto px-5 md:px-8 lg:px-12 xl:px-16 max-w-[1440px]">
          {partners.length === 0 ? (
            <div className="text-center py-20 md:py-24 max-w-xl mx-auto">
              <div className="text-6xl mb-6">🤝</div>
              <h2 className="font-['Saira_Condensed'] text-[28px] md:text-[40px] font-bold text-[#262335] mb-3">
                Aucun partenaire pour le moment
              </h2>
              <p className="text-base md:text-lg text-[#262335]/70 mb-8 leading-relaxed">
                Nous recherchons activement des partenaires pour enrichir notre festival.
              </p>
              <Link
                to="/contact"
                className="inline-block px-8 py-3.5 bg-[#463699] text-white rounded-xl font-semibold text-base md:text-lg hover:bg-[#8A83DA] transition-all duration-300"
              >
                Devenir partenaire
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-5 md:gap-8">
              {partners.map((partner, index) => (
                <div
                  key={partner.id}
                  draggable={isAdmin}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="
                    w-full
                    sm:w-[calc(50%-0.625rem)]
                    md:w-[calc(25%-1.5rem)]
                    opacity-0 animate-fadeInScale
                  "
                  style={{ 
                    animationDelay: `${index * 50}ms`, 
                    animationFillMode: 'forwards' 
                  }}
                >
                  <PartnerCard
                    partner={partner}
                    isAdmin={isAdmin}
                    onEdit={handleEditPartner}
                    isDragging={draggedItem === index}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}