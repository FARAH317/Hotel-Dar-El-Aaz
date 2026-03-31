import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchRoomById, selectCurrentRoom, selectRoomLoading } from '../store/roomSlice';
import { selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { 
  UserGroupIcon, 
  Square3Stack3DIcon,
  CheckCircleIcon,
  MapPinIcon,
  ArrowLeftIcon,
  SparklesIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/formatters';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import ReservationForm from '@/features/reservations/components/ReservationForm';

const RoomDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const room = useSelector(selectCurrentRoom);
  const isLoading = useSelector(selectRoomLoading);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(fetchRoomById(id));
  }, [dispatch, id]);

  if (isLoading) {
    return <Loading fullScreen text="Chargement de la chambre..." />;
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-8 w-8 text-[#C9A961]" />
          </div>
          <h2 
            className="text-2xl font-bold text-[#2C2416] mb-3"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Chambre Introuvable
          </h2>
          <p className="text-[#6B5D4F] mb-6 text-sm">Cette chambre n'existe pas ou a été supprimée</p>
          <Button onClick={() => navigate('/rooms')} variant="primary" size="sm">
            Retour aux Chambres
          </Button>
        </div>
      </div>
    );
  }

  const isAvailable = room.is_available || room.status === 'available';

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Breadcrumb & Back */}
      <section className="bg-white border-b border-[#EAE3D2] py-4">
        <div className="luxury-container">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-xs">
              <Link to="/" className="text-[#8B7965] hover:text-[#C9A961] transition-colors">
                Accueil
              </Link>
              <span className="text-[#8B7965]">/</span>
              <Link to="/rooms" className="text-[#8B7965] hover:text-[#C9A961] transition-colors">
                Chambres
              </Link>
              <span className="text-[#8B7965]">/</span>
              <span className="text-[#2C2416] font-medium">Chambre {room.room_number}</span>
            </nav>

            <button
              onClick={() => navigate('/rooms')}
              className="flex items-center gap-2 text-[#6B5D4F] hover:text-[#C9A961] transition-colors group text-sm"
            >
              <ArrowLeftIcon className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Room Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Main Image - RÉDUITE */}
              <div className="relative h-[350px] rounded-lg overflow-hidden shadow-2xl border border-[#EAE3D2]">
                {room.main_image ? (
                  <img
                    src={room.main_image}
                    alt={`Chambre ${room.room_number}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#F5F1E8] flex items-center justify-center">
                    <span className="text-7xl opacity-30">🏨</span>
                  </div>
                )}
                
                {/* Status Badge - RÉDUIT */}
                <div className="absolute top-4 right-4">
                  {isAvailable ? (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      Disponible
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Occupée
                    </div>
                  )}
                </div>

                {/* Type Badge - RÉDUIT */}
                <div className="absolute top-4 left-4">
                  <Badge color="primary" size="sm" className="shadow-lg">
                    {room.room_type?.name || 'Suite'}
                  </Badge>
                </div>
              </div>

              {/* Room Info Card */}
              <Card className="border-2 border-[#EAE3D2]">
                {/* Header - RÉDUIT */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-[#EAE3D2]">
                  <div>
                    <h1 
                      className="text-2xl font-bold text-[#2C2416] mb-1"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      Chambre {room.room_number}
                    </h1>
                    <p className="text-sm text-[#C9A961] font-medium">
                      {room.room_type?.name || 'Chambre Standard'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#C9A961]">
                      {formatCurrency(room.current_price)}
                    </p>
                    <p className="text-xs text-[#8B7965]">par nuit</p>
                  </div>
                </div>

                {/* Key Features Grid - RÉDUIT */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE3D2] text-center">
                    <UserGroupIcon className="h-5 w-5 text-[#C9A961] mx-auto mb-1" />
                    <p className="text-xs text-[#8B7965]">Capacité</p>
                    <p className="font-semibold text-[#2C2416] text-xs">
                      {room.room_type?.max_occupancy || 2} pers.
                    </p>
                  </div>
                  
                  {room.room_type?.size_sqm && (
                    <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE3D2] text-center">
                      <Square3Stack3DIcon className="h-5 w-5 text-[#C9A961] mx-auto mb-1" />
                      <p className="text-xs text-[#8B7965]">Superficie</p>
                      <p className="font-semibold text-[#2C2416] text-xs">
                        {room.room_type.size_sqm} m²
                      </p>
                    </div>
                  )}
                  
                  {room.view_type && (
                    <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE3D2] text-center">
                      <MapPinIcon className="h-5 w-5 text-[#C9A961] mx-auto mb-1" />
                      <p className="text-xs text-[#8B7965]">Vue</p>
                      <p className="font-semibold text-[#2C2416] text-xs">{room.view_type}</p>
                    </div>
                  )}
                  
                  <div className="bg-[#FDFBF7] p-2 rounded-lg border border-[#EAE3D2] text-center">
                    <BuildingOffice2Icon className="h-5 w-5 text-[#C9A961] mx-auto mb-1" />
                    <p className="text-xs text-[#8B7965]">Étage</p>
                    <p className="font-semibold text-[#2C2416] text-xs">
                      {room.floor_display || `${room.floor}ème`}
                    </p>
                  </div>
                </div>

                {/* Description - RÉDUIT */}
                {(room.description || room.room_type?.description) && (
                  <div className="mb-4">
                    <h3 
                      className="text-lg font-semibold text-[#2C2416] mb-2"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      Description
                    </h3>
                    <p className="text-[#6B5D4F] leading-relaxed text-sm">
                      {room.description || room.room_type.description}
                    </p>
                  </div>
                )}

                {/* Amenities - RÉDUIT */}
                {room.amenities && room.amenities.length > 0 && (
                  <div>
                    <h3 
                      className="text-lg font-semibold text-[#2C2416] mb-2"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      Équipements & Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {room.amenities.map((amenity) => (
                        <div 
                          key={amenity.id}
                          className="flex items-center gap-2 p-2 bg-[#FDFBF7] rounded-lg border border-[#EAE3D2]"
                        >
                          <CheckCircleIcon className="h-4 w-4 text-[#C9A961] flex-shrink-0" />
                          <span className="text-[#2C2416] text-sm">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Notes - RÉDUIT */}
                {room.special_notes && (
                  <div className="mt-4 p-3 bg-amber-50 border-l-4 border-[#C9A961] rounded-lg">
                    <div className="flex gap-2">
                      <SparklesIcon className="h-4 w-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#2C2416] text-sm mb-1">Note Spéciale</p>
                        <p className="text-xs text-[#6B5D4F]">{room.special_notes}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Policies Card - RÉDUIT */}
              <Card className="border-2 border-[#EAE3D2]">
                <h3 
                  className="text-lg font-semibold text-[#2C2416] mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  Politiques de l'Hôtel
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#2C2416] text-sm">Check-in / Check-out</p>
                      <p className="text-xs text-[#6B5D4F]">Arrivée à partir de 15h00 - Départ avant 11h00</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#2C2416] text-sm">Annulation</p>
                      <p className="text-xs text-[#6B5D4F]">Annulation gratuite jusqu'à 48h avant l'arrivée</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircleIcon className="h-4 w-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#2C2416] text-sm">Paiement</p>
                      <p className="text-xs text-[#6B5D4F]">Cartes bancaires et espèces acceptés</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Reservation */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                {isAuthenticated ? (
                  isAvailable ? (
                    <Card className="border-2 border-[#C9A961] shadow-xl">
                      <div className="text-center mb-4">
                        <h3 
                          className="text-xl font-bold text-[#2C2416] mb-2"
                          style={{ fontFamily: 'Cormorant Garamond, serif' }}
                        >
                          Réserver Maintenant
                        </h3>
                        <p className="text-xs text-[#6B5D4F]">
                          Remplissez le formulaire pour réserver
                        </p>
                      </div>
                      <ReservationForm room={room} />
                    </Card>
                  ) : (
                    <Card className="border-2 border-red-200 bg-red-50">
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🚫</span>
                        </div>
                        <h3 className="text-lg font-bold text-red-900 mb-2">
                          Non Disponible
                        </h3>
                        <p className="text-red-700 mb-4 text-sm">
                          Cette chambre n'est pas disponible actuellement
                        </p>
                        <Button onClick={() => navigate('/rooms')} variant="secondary" fullWidth size="sm">
                          Voir d'Autres Chambres
                        </Button>
                      </div>
                    </Card>
                  )
                ) : (
                  <Card className="border-2 border-[#C9A961] bg-[#FDFBF7]">
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-[#C9A961]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <SparklesIcon className="h-6 w-6 text-[#C9A961]" />
                      </div>
                      <h3 
                        className="text-lg font-bold text-[#2C2416] mb-3"
                        style={{ fontFamily: 'Cormorant Garamond, serif' }}
                      >
                        Connectez-vous
                      </h3>
                      <p className="text-[#6B5D4F] mb-4 text-sm">
                        Créez un compte pour réserver cette chambre
                      </p>
                      <Button onClick={() => navigate('/login')} variant="primary" fullWidth size="sm" className="mb-2">
                        Se Connecter
                      </Button>
                      <p className="text-xs text-[#6B5D4F]">
                        Pas de compte ?{' '}
                        <button 
                          onClick={() => navigate('/register')}
                          className="text-[#C9A961] hover:text-[#B8934A] font-medium underline"
                        >
                          S'inscrire
                        </button>
                      </p>
                    </div>
                  </Card>
                )}

                {/* Contact Card - RÉDUIT */}
                <Card className="mt-4 bg-[#F5F1E8] border-2 border-[#EAE3D2]">
                  <h4 className="font-semibold text-[#2C2416] mb-3 text-center text-sm">
                    Besoin d'Aide ?
                  </h4>
                  <div className="space-y-2 text-xs">
                    <a 
                      href="tel:+213560990863" 
                      className="flex items-center justify-center gap-2 text-[#6B5D4F] hover:text-[#C9A961] transition-colors"
                    >
                      📞 +213 555 12 34 56
                    </a>
                    <a 
                      href="mailto:contact@hoteldarelaaz.com" 
                      className="flex items-center justify-center gap-2 text-[#6B5D4F] hover:text-[#C9A961] transition-colors"
                    >
                      ✉️ contact@hoteldarelaaz.com
                    </a>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetails;