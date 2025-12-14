import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms, selectRooms, selectRoomLoading, selectRoomError } from '../store/roomSlice';
import RoomCard from './RoomCard';
import Loading from '@/components/Loading';

const RoomList = ({ filters = {} }) => {
  const dispatch = useDispatch();
  const rooms = useSelector(selectRooms);
  const isLoading = useSelector(selectRoomLoading);
  const error = useSelector(selectRoomError);
  
  const displayedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) {
      console.warn('⚠️ rooms n\'est pas un tableau:', rooms);
      return [];
    }
    return rooms;
  }, [rooms]);

  console.log('🏠 RoomList - Chambres totales:', rooms.length);
  console.log('🏠 RoomList - Chambres affichées:', displayedRooms.length);

  // ✅ SUPPRIMER ou COMMENTER ce useEffect qui recharge tout
  // useEffect(() => {
  //   console.log('📡 RoomList useEffect - Chargement avec filtres:', filters);
  //   dispatch(fetchRooms(filters));
  // }, [dispatch, filters]);

  // ✅ OU remplacer par un useEffect qui ne charge QUE au premier montage
  useEffect(() => {
    // Charger toutes les chambres seulement au premier chargement de la page
    if (rooms.length === 0) {
      console.log('📡 Chargement initial des chambres');
      dispatch(fetchRooms({}));
    }
  }, [dispatch]); // ⚠️ Ne pas mettre 'rooms' en dépendance !

  if (isLoading) {
    return <Loading text="Chargement des chambres..." />;
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">Erreur: {error}</p>
      </div>
    );
  }

  if (displayedRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucune chambre disponible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedRooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

export default RoomList;