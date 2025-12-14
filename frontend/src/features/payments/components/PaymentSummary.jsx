import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { PAYMENT_STATUS, PAYMENT_METHODS } from '@/utils/constants';
import Badge from '@/components/Badge';
import Card from '@/components/Card';

const PaymentSummary = ({ payments = [], summary = {} }) => {
  const totalPaid = summary.total_paid || 0;
  const totalPending = summary.total_pending || 0;
  const balanceDue = summary.balance_due || 0;
  const isFullyPaid = summary.is_fully_paid || balanceDue <= 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card title="Statut du paiement">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total payé</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          
          {totalPending > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">En attente</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(totalPending)}
              </span>
            </div>
          )}
          
          <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
            <span className="font-semibold text-gray-900">Reste à payer</span>
            <span className={`font-bold text-xl ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
              {isFullyPaid ? '✓ Payé' : formatCurrency(balanceDue)}
            </span>
          </div>

          {/* Progress bar */}
          {!isFullyPaid && summary.balance_due !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((totalPaid / (totalPaid + balanceDue)) * 100, 100)}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {((totalPaid / (totalPaid + balanceDue)) * 100).toFixed(0)}% payé
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Payments List */}
      {payments.length > 0 && (
        <Card title={`Historique des paiements (${payments.length})`}>
          <div className="space-y-3">
            {payments.map((payment) => {
              const status = PAYMENT_STATUS[payment.status];
              const method = PAYMENT_METHODS[payment.payment_method];
              
              return (
                <div 
                  key={payment.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {payment.payment_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.created_at)}
                      </p>
                    </div>
                    <Badge color={status?.color} size="sm">
                      {status?.label}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {method?.label || payment.payment_method_display}
                    </span>
                    <p className="text-lg font-bold text-primary-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>

                  {payment.transaction_id && (
                    <p className="text-xs text-gray-400 mt-2 font-mono">
                      ID: {payment.transaction_id}
                    </p>
                  )}

                  {payment.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      Note: {payment.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PaymentSummary;