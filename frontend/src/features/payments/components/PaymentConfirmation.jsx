import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentById, selectCurrentPayment } from '../store/paymentSlice';
import { fetchPaymentsByReservation, selectPayments } from '../store/paymentSlice';
import PaymentSummary from '../components/PaymentSummary';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { formatCurrency } from '@/utils/formatters';

const PaymentConfirmation = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const payment = useSelector(selectCurrentPayment);
  const payments = useSelector(selectPayments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Charger le paiement actuel
        const paymentResult = await dispatch(fetchPaymentById(paymentId)).unwrap();
        
        // Charger tous les paiements de la réservation pour mise à jour
        if (paymentResult?.reservation?.id) {
          await dispatch(fetchPaymentsByReservation(paymentResult.reservation.id)).unwrap();
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, paymentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-[#C9A961] mx-auto mb-4"></div>
          <p className="text-[#6B5D4F] text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2416] mb-4">Paiement introuvable</h2>
          <Button onClick={() => navigate('/my-reservations')}>
            Retour aux réservations
          </Button>
        </div>
      </div>
    );
  }

  // Calculer le résumé depuis les paiements
  const summary = payments?.summary || {
    total_paid: 0,
    total_pending: 0,
    balance_due: payment.reservation?.total_amount || 0,
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête de confirmation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 
            className="text-4xl font-bold text-[#2C2416] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Paiement Confirmé !
          </h1>
          <div className="h-1 w-32 bg-[#C9A961] mx-auto mb-4"></div>
          <p className="text-[#6B5D4F] text-lg">
            Votre paiement de <span className="font-bold text-[#C9A961]">{formatCurrency(payment.amount)}</span> a été traité avec succès
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Détails du paiement */}
          <Card title="Détails du paiement">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#6B5D4F]">Numéro</span>
                <span className="font-semibold text-[#2C2416]">{payment.payment_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D4F]">Méthode</span>
                <span className="font-semibold text-[#2C2416]">{payment.payment_method_display}</span>
              </div>
              {payment.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-[#6B5D4F]">Transaction ID</span>
                  <span className="font-mono text-sm text-[#2C2416]">{payment.transaction_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B5D4F]">Date</span>
                <span className="text-sm text-[#2C2416]">
                  {new Date(payment.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B5D4F]">Réservation</span>
                <span className="text-sm text-[#2C2416]">
                  {payment.reservation?.reservation_number || payment.reservation_number}
                </span>
              </div>
            </div>
          </Card>

          {/* ✅ Résumé des paiements */}
          <PaymentSummary 
            payments={payments?.payments || []} 
            summary={summary} 
          />
        </div>

        {/* Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(`/reservations/${payment.reservation?.id || payment.reservation}`)}
          >
            📋 Voir ma réservation
          </Button>
          
          <Button
            variant="secondary"
            fullWidth
            onClick={() => navigate('/my-reservations')}
          >
            🏠 Mes réservations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;