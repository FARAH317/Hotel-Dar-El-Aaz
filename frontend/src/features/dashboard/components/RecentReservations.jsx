import { Link } from 'react-router-dom';
import { formatDate, formatCurrency, getStatusBadgeClass } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';
import Badge from '@/components/Badge';
import Card from '@/components/Card';

const RecentReservations = ({ reservations = [] }) => {
  if (reservations.length === 0) {
    return (
      <Card title="Réservations récentes">
        <p className="text-gray-500 text-center py-8">Aucune réservation récente</p>
      </Card>
    );
  }

  return (
    <Card 
      title="Réservations récentes"
      footer={
        <Link to="/dashboard/reservations" className="text-sm text-primary-600 hover:text-primary-700">
          Voir toutes les réservations →
        </Link>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chambre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => {
              const status = RESERVATION_STATUS[reservation.status];
              return (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link 
                      to={`/reservations/${reservation.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-900"
                    >
                      {reservation.reservation_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.user_name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.room_number}
                    </div>
                    <div className="text-sm text-gray-500">{reservation.room_type}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(reservation.check_in_date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {reservation.duration_days} nuits
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(reservation.total_amount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge color={status?.color} size="sm">
                      {status?.label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentReservations;