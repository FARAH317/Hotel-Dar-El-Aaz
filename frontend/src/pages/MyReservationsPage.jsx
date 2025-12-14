import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyReservations, selectMyReservations, selectReservationLoading } from '@/features/reservations/store/reservationSlice';
import { RESERVATION_STATUS } from '@/utils/constants';
import ReservationCard from '@/features/reservations/components/ReservationCard';
import Select from '@/components/Select';
import Loading from '@/components/Loading';

const MyReservationsPage = () => {
  const dispatch = useDispatch();
  const reservations = useSelector(selectMyReservations);
  const isLoading = useSelector(selectReservationLoading);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchMyReservations({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.values(RESERVATION_STATUS).map(status => ({
      value: status.value,
      label: status.label,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
        <p className="text-gray-600">Gérez toutes vos réservations</p>
      </div>

      <div className="mb-6 max-w-xs">
        <Select
          label="Filtrer par statut"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
        />
      </div>

      {isLoading ? (
        <Loading text="Chargement de vos réservations..." />
      ) : reservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Aucune réservation trouvée</p>
          <p className="text-gray-400">Commencez par réserver une chambre !</p>
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;