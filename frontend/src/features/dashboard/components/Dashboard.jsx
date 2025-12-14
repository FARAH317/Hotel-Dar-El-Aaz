import { useEffect, useState } from 'react';
import { 
  HomeIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/formatters';
import dashboardService from '../services/dashboardService';
import StatsCard from './StatsCard';
import RecentReservations from './RecentReservations';
import Card from '@/components/Card';
import Loading from '@/components/Loading';
import Badge from '@/components/Badge';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [todaysCheckIns, setTodaysCheckIns] = useState([]);
  const [todaysCheckOuts, setTodaysCheckOuts] = useState([]);
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        dashboardStats,
        recentRes,
        checkIns,
        checkOuts,
        upcoming
      ] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentReservations(5),
        dashboardService.getTodaysCheckIns(),
        dashboardService.getTodaysCheckOuts(),
        dashboardService.getUpcomingReservations(7),
      ]);

      setStats(dashboardStats);
      setRecentReservations(recentRes.results || recentRes);
      setTodaysCheckIns(checkIns);
      setTodaysCheckOuts(checkOuts);
      setUpcomingReservations(upcoming);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Chargement du dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Vue d'ensemble de votre hôtel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Chambres Disponibles"
          value={stats?.rooms?.available || 0}
          icon={HomeIcon}
          color="success"
          trend={5}
          trendLabel="vs mois dernier"
        />
        
        <StatsCard
          title="Réservations Actives"
          value={stats?.reservations?.confirmed + stats?.reservations?.checked_in || 0}
          icon={CalendarIcon}
          color="primary"
          trend={12}
          trendLabel="vs mois dernier"
        />
        
        <StatsCard
          title="Revenus du mois"
          value={formatCurrency(stats?.payments?.total_amount || 0)}
          icon={CurrencyDollarIcon}
          color="info"
          trend={8}
          trendLabel="vs mois dernier"
        />
        
        <StatsCard
          title="Taux d'occupation"
          value={`${Math.round((stats?.rooms?.occupied / stats?.rooms?.total) * 100 || 0)}%`}
          icon={ArrowTrendingUpIcon}
          color="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Today's Check-ins */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-green-600" />
              <span>Check-ins aujourd'hui</span>
              <Badge color="success">{todaysCheckIns.length}</Badge>
            </div>
          }
        >
          {todaysCheckIns.length > 0 ? (
            <div className="space-y-3">
              {todaysCheckIns.map((reservation) => (
                <div 
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{reservation.user_name}</p>
                    <p className="text-sm text-gray-600">
                      Chambre {reservation.room_number}
                    </p>
                  </div>
                  <Badge color="success" size="sm">Check-in</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun check-in prévu aujourd'hui</p>
          )}
        </Card>

        {/* Today's Check-outs */}
        <Card 
          title={
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-600" />
              <span>Check-outs aujourd'hui</span>
              <Badge color="warning">{todaysCheckOuts.length}</Badge>
            </div>
          }
        >
          {todaysCheckOuts.length > 0 ? (
            <div className="space-y-3">
              {todaysCheckOuts.map((reservation) => (
                <div 
                  key={reservation.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{reservation.user_name}</p>
                    <p className="text-sm text-gray-600">
                      Chambre {reservation.room_number}
                    </p>
                  </div>
                  <Badge color="warning" size="sm">Check-out</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun check-out prévu aujourd'hui</p>
          )}
        </Card>
      </div>

      {/* Upcoming Reservations */}
      {upcomingReservations.length > 0 && (
        <Card 
          title="Prochaines arrivées (7 jours)"
          className="mb-8"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chambre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Durée
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {new Date(reservation.check_in_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      {reservation.user_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {reservation.room_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {reservation.duration_days} nuits
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Reservations */}
      <RecentReservations reservations={recentReservations} />

      {/* Stats by Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Réservations confirmées</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.reservations?.confirmed || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Clients présents</p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.reservations?.checked_in || 0}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Paiements en attente</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats?.payments?.pending || 0}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;