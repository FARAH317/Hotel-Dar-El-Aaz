import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  Square3Stack3DIcon,
  WifiIcon,
  TvIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/formatters';
import Badge from '@/components/Badge';
import Button from '@/components/Button';

const RoomCard = ({ room, viewMode = 'grid' }) => {
  // Vérifier si room existe
  if (!room) return null;

  // Get room badge based on type or status
  const getBadgeInfo = () => {
    const roomTypeName = room.room_type_name || room.room_type || '';
    if (roomTypeName.toLowerCase().includes('suite')) return { label: 'Suite', color: 'primary' };
    if (roomTypeName.toLowerCase().includes('deluxe')) return { label: 'Deluxe', color: 'primary' };
    if (roomTypeName.toLowerCase().includes('premium')) return { label: 'Premium', color: 'primary' };
    return { label: 'Standard', color: 'secondary' };
  };

  const badge = getBadgeInfo();
  const isAvailable = room.is_available || room.status === 'available';
  
  // Données de la chambre avec fallbacks
  const roomNumber = room.room_number || room.number || 'N/A';
  const roomType = room.room_type_name || room.room_type || 'Chambre Standard';
  const price = room.current_price || room.price_per_night || room.price || 0;
  const maxOccupancy = room.room_type?.max_occupancy || room.capacity || 2;
  const sizeSqm = room.room_type?.size_sqm || room.size || null;
  const viewType = room.view_type || room.view || null;
  const mainImage = room.main_image || room.image_url || room.image || null;
  const description = room.description || '';

  // Grid Mode (default) - VERSION COMPACTE
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#EAE3D2] animate-fade-in">
        {/* Image - Réduite à h-48 */}
        <div className="relative h-48 overflow-hidden">
          {mainImage ? (
            <img 
              src={mainImage}
              alt={`Chambre ${roomNumber}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#F5F1E8] flex items-center justify-center">
              <span className="text-6xl opacity-30">🏨</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badge Type - Taille réduite */}
          <div className="absolute top-3 right-3">
            <Badge color={badge.color} size="sm" className="shadow-lg text-xs">
              {badge.label}
            </Badge>
          </div>

          {/* Available Status - Taille réduite */}
          {isAvailable ? (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Disponible
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Occupée
            </div>
          )}
        </div>

        {/* Content - Padding réduit */}
        <div className="p-4">
          {/* Room Type - Étoiles supprimées pour gagner de l'espace */}
          <div className="mb-2">
            <span className="text-xs uppercase tracking-wide text-[#C9A961] font-semibold">
              {roomType}
            </span>
          </div>

          {/* Room Number/Title - Taille réduite */}
          <h3 
            className="text-lg font-semibold text-[#2C2416] mb-2 group-hover:text-[#C9A961] transition-colors"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Chambre {roomNumber}
          </h3>

          {/* View Type - Taille réduite */}
          {viewType && (
            <p className="text-[#6B5D4F] text-xs mb-3">
              📍 {viewType}
            </p>
          )}

          {/* Amenities - Compactes */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[#EAE3D2]">
            <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
              <UserGroupIcon className="h-4 w-4 text-[#C9A961]" />
              <span>{maxOccupancy}</span>
            </div>
            {sizeSqm && (
              <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
                <Square3Stack3DIcon className="h-4 w-4 text-[#C9A961]" />
                <span>{sizeSqm}m²</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
              <WifiIcon className="h-4 w-4 text-[#C9A961]" />
            </div>
          </div>

          {/* Price & CTA - Compacts */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-[#C9A961]">
                {formatCurrency(price)}
              </span>
              <span className="text-[#8B7965] text-xs"> /nuit</span>
            </div>
            <Link to={`/rooms/${room.id}`}>
              <Button variant="secondary" size="sm" className="text-xs px-3 py-1.5">
                Détails
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // List Mode (horizontal layout) - VERSION COMPACTE
  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#EAE3D2] animate-fade-in">
      <div className="flex flex-col md:flex-row">
        {/* Image - Largeur réduite */}
        <div className="relative md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
          {mainImage ? (
            <img 
              src={mainImage}
              alt={`Chambre ${roomNumber}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full bg-[#F5F1E8] flex items-center justify-center">
              <span className="text-6xl opacity-30">🏨</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badges - Compacts */}
          <div className="absolute top-3 right-3">
            <Badge color={badge.color} size="sm" className="shadow-lg text-xs">
              {badge.label}
            </Badge>
          </div>

          {/* Available Status */}
          {isAvailable ? (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Disponible
            </div>
          ) : (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              Occupée
            </div>
          )}
        </div>

        {/* Content - Padding réduit */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-xs uppercase tracking-wide text-[#C9A961] font-semibold">
                  {roomType}
                </span>
                <h3 
                  className="text-lg font-semibold text-[#2C2416] mt-1 group-hover:text-[#C9A961] transition-colors"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  Chambre {roomNumber}
                </h3>
              </div>
            </div>

            {/* View Type */}
            {viewType && (
              <p className="text-[#6B5D4F] text-xs mb-3">
                📍 {viewType}
              </p>
            )}

            {/* Description */}
            {description && (
              <p className="text-[#6B5D4F] text-sm leading-relaxed mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Amenities - Compactes */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
                <UserGroupIcon className="h-4 w-4 text-[#C9A961]" />
                <span>{maxOccupancy} pers.</span>
              </div>
              {sizeSqm && (
                <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
                  <Square3Stack3DIcon className="h-4 w-4 text-[#C9A961]" />
                  <span>{sizeSqm}m²</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
                <WifiIcon className="h-4 w-4 text-[#C9A961]" />
                <span>WiFi</span>
              </div>
              <div className="flex items-center gap-1 text-[#6B5D4F] text-xs">
                <TvIcon className="h-4 w-4 text-[#C9A961]" />
                <span>TV</span>
              </div>
            </div>
          </div>

          {/* Price & CTA - Compacts */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EAE3D2]">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-[#C9A961]">
                  {formatCurrency(price)}
                </span>
                <span className="text-[#8B7965] text-xs">/nuit</span>
              </div>
            </div>
            <Link to={`/rooms/${room.id}`}>
              <Button variant="primary" size="sm" className="group/btn text-xs">
                Détails
                <ArrowRightIcon className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;