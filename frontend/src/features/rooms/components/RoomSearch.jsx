import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoomTypes, selectRoomTypes, searchRooms } from '../store/roomSlice'; // ✅ Importer searchRooms
import DatePicker from '@/components/DatePicker';
import Select from '@/components/Select';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { MagnifyingGlassIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const RoomSearch = ({ onSearch }) => {
  const dispatch = useDispatch();
  const roomTypes = useSelector(selectRoomTypes);

  const [filters, setFilters] = useState({
    check_in: null,
    check_out: null,
    room_type_id: '',
    min_price: '',
    max_price: '',
  });

  useEffect(() => {
    console.log('📄 Chargement des types de chambres...');
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  const handleChange = (field, value) => {
    console.log(`🔍 Changement de ${field}:`, value);
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    console.log('🔍 Début de la recherche avec filtres bruts:', filters);
    
    const searchParams = {};
    
    // ✅ BUG CORRIGÉ : Convertir les dates
    if (filters.check_in) {
      searchParams.check_in = filters.check_in.toLocaleDateString("en-CA");
    }
    if (filters.check_out) {
      searchParams.check_out = filters.check_out.toLocaleDateString("en-CA");
    }
    
    // Ajouter les autres filtres seulement s'ils ont une valeur
    if (filters.room_type_id) {
      searchParams.room_type_id = filters.room_type_id;  // ✅ Convertir en nombre
    }
    if (filters.min_price) {
      searchParams.min_price = parseFloat(filters.min_price); // ✅ Convertir en nombre
    }
    if (filters.max_price) {
      searchParams.max_price = parseFloat(filters.max_price); // ✅ Convertir en nombre
    }

    console.log('📤 Paramètres de recherche envoyés:', searchParams);
    console.log('📡 Dispatch searchRooms avec params:', searchParams);
    
    // ✅ Utiliser searchRooms au lieu de fetchRooms
    dispatch(searchRooms(searchParams))
      .unwrap()
      .then(result => {
        console.log('✅ Résultats de recherche reçus:', result);
        const roomsArray = result.results || result; // pour gérer pagination ou non
        console.log(`✅ Nombre de chambres trouvées: ${roomsArray.length}`);
      })
      .catch(error => {
        console.error('❌ Erreur lors de la recherche:', error);
      });
    
    // Passer les filtres au parent
    if (onSearch) {
      console.log('📢 Envoi des filtres au parent');
      onSearch(searchParams);
    }
  };

  const handleReset = () => {
    console.log('🔄 Réinitialisation des filtres');
    
    const emptyFilters = {
      check_in: null,
      check_out: null,
      room_type_id: '',
      min_price: '',
      max_price: '',
    };
    
    setFilters(emptyFilters);
    
    console.log('📡 Rechargement de toutes les chambres');
    // ✅ Utiliser searchRooms avec paramètres vides pour avoir toutes les chambres disponibles
    dispatch(searchRooms({}))
      .unwrap()
      .then(result => {
        const roomsArray = result.results || result;
        console.log('✅ Toutes les chambres rechargées:', roomsArray.length);
      })
      .catch(error => {
        console.error('❌ Erreur lors du rechargement:', error);
      });
    
    if (onSearch) {
      onSearch({});
    }
  };

  const roomTypeOptions = roomTypes.map(type => ({
    value: type.id,
    label: `${type.name} - ${type.base_price} DZD/nuit`,
  }));

  console.log('🎨 Render RoomSearch - Types disponibles:', roomTypes.length);

  return (
    <div className="bg-white rounded-lg p-6 border-2 border-[#EAE3D2]">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 
          className="text-2xl font-bold text-[#2C2416] mb-2"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Rechercher une Chambre
        </h3>
        <p className="text-sm text-[#6B5D4F]">
          Trouvez la chambre parfaite pour votre séjour
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date d'arrivée */}
        <div className="relative">
          <DatePicker
            label="Date d'arrivée"
            selected={filters.check_in}
            onChange={(date) => handleChange('check_in', date)}
            minDate={new Date()}
            placeholder="Sélectionner..."
            className="w-full"
          />
        </div>

        {/* Date de départ */}
        <div className="relative">
          <DatePicker
            label="Date de départ"
            selected={filters.check_out}
            onChange={(date) => handleChange('check_out', date)}
            minDate={filters.check_in || new Date()}
            placeholder="Sélectionner..."
            disabled={!filters.check_in}
            className="w-full"
          />
        </div>

        {/* Type de chambre */}
        <div className="relative">
          <Select
            label="Type de chambre"
            name="room_type_id"
            value={filters.room_type_id}
            onChange={(e) => handleChange('room_type_id', e.target.value)}
            options={roomTypeOptions}
            placeholder="Tous les types"
          />
        </div>

        {/* Prix minimum */}
        <div className="relative">
          <Input
            label="Prix minimum"
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={(e) => handleChange('min_price', e.target.value)}
            placeholder="0 DZD"
            icon={<CurrencyDollarIcon className="h-5 w-5 text-[#C9A961]" />}
          />
        </div>

        {/* Prix maximum */}
        <div className="relative">
          <Input
            label="Prix maximum"
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={(e) => handleChange('max_price', e.target.value)}
            placeholder="50000 DZD"
            icon={<CurrencyDollarIcon className="h-5 w-5 text-[#C9A961]" />}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-end gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={handleSearch}
            className="flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Rechercher
          </Button>
          <Button
            variant="secondary"
            onClick={handleReset}
            className="whitespace-nowrap"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.check_in || filters.check_out || filters.room_type_id || filters.min_price || filters.max_price) && (
        <div className="mt-4 pt-4 border-t border-[#EAE3D2]">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-[#6B5D4F] font-medium">Filtres actifs:</span>
            
            {filters.check_in && (
              <span className="inline-flex items-center gap-1 bg-[#F5F1E8] text-[#2C2416] px-3 py-1 rounded-full text-xs">
                <CalendarIcon className="h-3 w-3" />
                {filters.check_in.toLocaleDateString('fr-FR')}
              </span>
            )}
            
            {filters.check_out && (
              <span className="inline-flex items-center gap-1 bg-[#F5F1E8] text-[#2C2416] px-3 py-1 rounded-full text-xs">
                <CalendarIcon className="h-3 w-3" />
                {filters.check_out.toLocaleDateString('fr-FR')}
              </span>
            )}
            
            {filters.room_type_id && (
              <span className="bg-[#C9A961]/10 text-[#B8934A] px-3 py-1 rounded-full text-xs font-medium">
                {roomTypes.find(t => t.id === Number(filters.room_type_id))?.name || 'Type sélectionné'}
              </span>
            )}
            
            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 bg-[#F5F1E8] text-[#2C2416] px-3 py-1 rounded-full text-xs">
                <CurrencyDollarIcon className="h-3 w-3" />
                {filters.min_price || '0'} - {filters.max_price || '∞'} DZD
              </span>
            )}
            
            <button
              onClick={handleReset}
              className="text-xs text-[#C9A961] hover:text-[#B8934A] underline ml-2"
            >
              Tout effacer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSearch;