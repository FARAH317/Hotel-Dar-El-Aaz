import { useState } from 'react';
import RoomSearch from '@/features/rooms/components/RoomSearch';
import RoomList from '@/features/rooms/components/RoomList';
import { SparklesIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const RoomListPage = () => {
  const [searchFilters, setSearchFilters] = useState({});
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setSearchFilters(prev => ({
      ...prev,
      sortBy: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section 
        className="relative py-32 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(44, 36, 22, 0.95) 0%, rgba(44, 36, 22, 0.85) 100%), url("https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #C9A961 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="relative luxury-container text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 px-4 py-2 rounded-full mb-6 animate-fade-in">
            <SparklesIcon className="h-4 w-4 text-[#C9A961]" />
            <span className="text-sm text-[#E5D4A6] font-medium uppercase tracking-wide">
              Luxury Rooms & Suites
            </span>
          </div>

          {/* Title */}
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in"
            style={{ 
              fontFamily: 'Cormorant Garamond, serif',
              animationDelay: '100ms'
            }}
          >
            Nos Chambres d'Exception
          </h1>

          {/* Description */}
          <p 
            className="text-lg md:text-xl text-[#EAE3D2] max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            Découvrez nos chambres et suites luxueuses, conçues pour offrir 
            confort absolu et élégance raffinée
          </p>

          {/* Divider */}
          <div className="w-20 h-1 bg-[#C9A961] mx-auto mt-8"></div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative -mt-16 z-10">
        <div className="luxury-container">
          <div className="bg-white rounded-lg shadow-2xl p-8 border border-[#EAE3D2]">
            <RoomSearch onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Filters Info */}
      <section className="py-8">
        <div className="luxury-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 
                className="text-2xl font-semibold text-[#2C2416]"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Nos Chambres Disponibles
              </h2>
              <p className="text-[#6B5D4F] mt-1">
                Trouvez la chambre parfaite pour votre séjour
              </p>
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-[#C9A961]" />
                <span className="text-sm text-[#6B5D4F] font-medium">Trier par:</span>
                <select 
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-2 border border-[#EAE3D2] rounded-sm bg-white text-[#2C2416] focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30 transition-all cursor-pointer"
                >
                  <option value="default">Pertinence</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="popularity">Popularité</option>
                  <option value="rating">Meilleure note</option>
                  <option value="newest">Plus récent</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-2 bg-[#F5F1E8] rounded-sm p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[#C9A961] text-white' 
                      : 'text-[#6B5D4F] hover:text-[#C9A961]'
                  }`}
                  title="Vue grille"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#C9A961] text-white' 
                      : 'text-[#6B5D4F] hover:text-[#C9A961]'
                  }`}
                  title="Vue liste"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {Object.keys(searchFilters).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(searchFilters).map(([key, value]) => {
                if (!value || key === 'sortBy') return null;
                return (
                  <div 
                    key={key}
                    className="inline-flex items-center gap-2 bg-[#F5F1E8] px-3 py-1 rounded-full text-sm"
                  >
                    <span className="text-[#6B5D4F]">
                      <strong className="text-[#2C2416] capitalize">{key}:</strong> {value}
                    </span>
                    <button
                      onClick={() => {
                        const newFilters = { ...searchFilters };
                        delete newFilters[key];
                        setSearchFilters(newFilters);
                      }}
                      className="text-[#C9A961] hover:text-[#B8934A]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => setSearchFilters({})}
                className="text-sm text-[#C9A961] hover:text-[#B8934A] font-medium underline"
              >
                Effacer tout
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Room List */}
      <section className="pb-20">
        <div className="luxury-container">
          <RoomList filters={searchFilters} viewMode={viewMode} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="luxury-container text-center">
          <span className="section-title">Besoin d'Aide ?</span>
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#2C2416] mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Notre équipe est là pour vous
          </h2>
          <div className="divider"></div>
          <p className="text-[#6B5D4F] mb-8 max-w-2xl mx-auto">
            Contactez notre service client pour toute question ou demande spéciale
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+213555123456" className="btn-primary">
              📞 Appeler Maintenant
            </a>
            <a href="mailto:contact@hoteldarelaaz.com" className="btn-secondary">
              ✉️ Envoyer un Email
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomListPage;