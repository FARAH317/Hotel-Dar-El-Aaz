import { Link } from 'react-router-dom';
import { CalendarIcon, HomeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatDate, formatCurrency, getStatusBadgeClass } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';

const ReservationCard = ({ reservation }) => {
  const status = RESERVATION_STATUS[reservation.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {reservation.reservation_number}
          </h3>
          <p className="text-sm text-gray-500">
            Créée le {formatDate(reservation.created_at)}
          </p>
        </div>
        <Badge color={status?.color || 'secondary'}>
          {status?.label || reservation.status_display}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <HomeIcon className="h-5 w-5 mr-2" />
          <span>
            Chambre {reservation.room_number} - {reservation.room_type}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-5 w-5 mr-2" />
          <span>
            {formatDate(reservation.check_in_date)} → {formatDate(reservation.check_out_date)}
          </span>
          <span className="ml-2 text-gray-400">
            ({reservation.duration_days} nuits)
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <CurrencyDollarIcon className="h-5 w-5 mr-2" />
          <span className="font-semibold text-primary-600">
            {formatCurrency(reservation.total_amount)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/reservations/${reservation.id}`} className="flex-1">
          <Button fullWidth variant="primary" size="sm">
            Voir les détails
          </Button>
        </Link>
        
        {reservation.can_cancel && (
          <Button variant="danger" size="sm">
            Annuler
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ReservationCard;