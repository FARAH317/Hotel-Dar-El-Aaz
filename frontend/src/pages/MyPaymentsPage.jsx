import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyPayments, selectMyPayments, selectPaymentLoading } from '@/features/payments/store/paymentSlice';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '@/utils/constants';
import Badge from '@/components/Badge';
import Card from '@/components/Card';
import Loading from '@/components/Loading';

const MyPaymentsPage = () => {
  const dispatch = useDispatch();
  const payments = useSelector(selectMyPayments);
  const isLoading = useSelector(selectPaymentLoading);

  useEffect(() => {
    // Charger les paiements au montage du composant
    dispatch(fetchMyPayments());
  }, [dispatch]);

  if (isLoading) {
    return <Loading fullScreen text="Chargement de vos paiements..." />;
  }

  // Calculer les statistiques
  const completedPayments = payments.filter(p => p.status === 'COMPLETED');
  const totalAmount = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Paiements</h1>
        <p className="text-gray-600">Historique de tous vos paiements</p>
      </div>

      {/* Statistiques */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Total des paiements</p>
              <p className="text-2xl font-bold text-primary-600">
                {payments.length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Paiements réussis</p>
              <p className="text-2xl font-bold text-green-600">
                {completedPayments.length}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Montant total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </Card>
        </div>
      )}

      {payments.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Réservation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => {
                  const status = PAYMENT_STATUS[payment.status];
                  const method = PAYMENT_METHODS[payment.payment_method];
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.payment_number}
                        </div>
                        {payment.transaction_id && (
                          <div className="text-xs text-gray-500 font-mono">
                            {payment.transaction_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/reservations/${payment.reservation}`}
                          className="text-sm text-primary-600 hover:text-primary-900 hover:underline"
                        >
                          {payment.reservation_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {method?.label || payment.payment_method_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={status?.color}>
                          {status?.label || payment.status_display}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/payment-confirmation/${payment.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Voir détails
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-500 text-lg mb-2">Aucun paiement trouvé</p>
          <p className="text-gray-400">Vos paiements apparaîtront ici après avoir effectué votre première transaction</p>
        </div>
      )}
    </div>
  );
};

export default MyPaymentsPage;