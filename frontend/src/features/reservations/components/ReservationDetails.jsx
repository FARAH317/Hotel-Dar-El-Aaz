import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  fetchReservationById, 
  cancelReservation,
  selectCurrentReservation, 
  selectReservationLoading 
} from '../store/reservationSlice';
import { 
  fetchPaymentsByReservation, 
  selectPaymentsByReservation 
} from '@/features/payments/store/paymentSlice';
import { 
  fetchUnreadNotifications, 
  fetchNotificationCounts 
} from '@/features/notifications/store/notificationsSlice';
import { 
  CalendarIcon, 
  HomeIcon, 
  UserIcon,
  ClockIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/formatters';
import { RESERVATION_STATUS } from '@/utils/constants';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import PaymentSummary from '@/features/payments/components/PaymentSummary';

const ReservationDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const reservation = useSelector(selectCurrentReservation);
  const paymentsData = useSelector(selectPaymentsByReservation);
  const isLoading = useSelector(selectReservationLoading);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await dispatch(fetchReservationById(id));
      await dispatch(fetchPaymentsByReservation(id));
    };
    
    loadData();
  }, [dispatch, id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchPaymentsByReservation(id));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, id]);

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      setCancelError('');
      
      // Annulation de la réservation
      const result = await dispatch(cancelReservation({ 
        id, 
        reason: cancelReason.trim() || undefined 
      })).unwrap();
      
      // Succès - fermer le modal
      setShowCancelModal(false);
      setCancelReason('');
      
      // Recharger les données
      await dispatch(fetchReservationById(id));
      
      // Mettre à jour les notifications
      dispatch(fetchUnreadNotifications());
      dispatch(fetchNotificationCounts());
      
      // Optionnel : afficher un message de succès
      // toast.success('Réservation annulée avec succès');
      
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      setCancelError(
        error?.message || 
        'Une erreur est survenue lors de l\'annulation. Veuillez réessayer.'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setCancelError('');
  };

  if (isLoading) {
    return <Loading fullScreen text="Chargement de la réservation..." />;
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="h-8 w-8 text-[#C9A961]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2C2416] mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Réservation Introuvable
          </h2>
          <p className="text-[#6B5D4F] mb-6">Cette réservation n'existe pas ou a été supprimée</p>
          <Button onClick={() => navigate('/my-reservations')} variant="primary">
            Retour aux Réservations
          </Button>
        </div>
      </div>
    );
  }

  const status = RESERVATION_STATUS[reservation.status];
  const payments = paymentsData?.payments || [];
  const summary = paymentsData?.summary || {
    total_paid: 0,
    total_pending: 0,
    balance_due: reservation.total_amount || 0,
    is_fully_paid: false,
    payments_count: 0,
  };

  const totalPaid = parseFloat(summary.total_paid) || 0;
  const balanceDue = parseFloat(summary.balance_due) || 0;
  const isFullyPaid = summary.is_fully_paid || balanceDue <= 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Breadcrumb */}
      <section className="bg-white border-b border-[#EAE3D2] py-4">
        <div className="luxury-container">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-xs">
              <Link to="/" className="text-[#8B7965] hover:text-[#C9A961] transition-colors">
                Accueil
              </Link>
              <span className="text-[#8B7965]">/</span>
              <Link to="/my-reservations" className="text-[#8B7965] hover:text-[#C9A961] transition-colors">
                Mes Réservations
              </Link>
              <span className="text-[#8B7965]">/</span>
              <span className="text-[#2C2416] font-medium">{reservation.reservation_number}</span>
            </nav>

            <button
              onClick={() => navigate('/my-reservations')}
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
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <Card className="border-2 border-[#EAE3D2]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 
                      className="text-3xl font-bold text-[#2C2416] mb-2"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {reservation.reservation_number}
                    </h1>
                    <p className="text-sm text-[#8B7965]">
                      Créée le {formatDateTime(reservation.created_at)}
                    </p>
                  </div>
                  <Badge color={status?.color} size="md">
                    {status?.label}
                  </Badge>
                </div>

                {/* Room Info */}
                <div className="flex items-start gap-3 p-4 bg-[#FDFBF7] rounded-lg border border-[#EAE3D2]">
                  <div className="w-12 h-12 bg-[#C9A961]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <HomeIcon className="h-6 w-6 text-[#C9A961]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C2416]">
                      Chambre {reservation.room.room_number}
                    </h3>
                    <p className="text-[#6B5D4F] text-sm">{reservation.room.room_type?.name}</p>
                  </div>
                </div>
              </Card>

              {/* Dates */}
              <Card title="Dates du Séjour" className="border-2 border-[#EAE3D2]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FDFBF7] p-4 rounded-lg border border-[#EAE3D2]">
                    <div className="flex items-center gap-2 text-xs text-[#8B7965] mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="uppercase tracking-wide">Arrivée</span>
                    </div>
                    <p className="text-lg font-bold text-[#2C2416]">{formatDate(reservation.check_in_date)}</p>
                    {reservation.actual_check_in && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Check-in: {formatDateTime(reservation.actual_check_in)}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#FDFBF7] p-4 rounded-lg border border-[#EAE3D2]">
                    <div className="flex items-center gap-2 text-xs text-[#8B7965] mb-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="uppercase tracking-wide">Départ</span>
                    </div>
                    <p className="text-lg font-bold text-[#2C2416]">{formatDate(reservation.check_out_date)}</p>
                    {reservation.actual_check_out && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <CheckCircleIcon className="h-4 w-4" />
                        Check-out: {formatDateTime(reservation.actual_check_out)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-[#C9A961]/10 rounded-lg border border-[#C9A961]/20">
                  <div className="flex items-center justify-center gap-2">
                    <ClockIcon className="h-5 w-5 text-[#C9A961]" />
                    <span className="font-bold text-[#2C2416]">
                      {reservation.duration_days} nuit{reservation.duration_days > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Guest Info */}
              <Card title="Informations Client" className="border-2 border-[#EAE3D2]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#FDFBF7] rounded-lg">
                    <UserIcon className="h-5 w-5 text-[#C9A961]" />
                    <div>
                      <p className="text-xs text-[#8B7965]">Nombre d'invités</p>
                      <p className="font-semibold text-[#2C2416]">{reservation.number_of_guests} personne(s)</p>
                    </div>
                  </div>

                  {reservation.guest_name && (
                    <div className="p-3 bg-[#FDFBF7] rounded-lg">
                      <p className="text-xs text-[#8B7965] mb-1">Nom de l'invité</p>
                      <p className="font-semibold text-[#2C2416]">{reservation.guest_name}</p>
                    </div>
                  )}

                  {reservation.special_requests && (
                    <div className="p-3 bg-[#FDFBF7] rounded-lg border border-[#EAE3D2]">
                      <p className="text-xs text-[#8B7965] mb-2 uppercase tracking-wide">Demandes spéciales</p>
                      <p className="text-sm text-[#2C2416] leading-relaxed">{reservation.special_requests}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Cancellation Info */}
              {reservation.status === 'CANCELLED' && (
                <Card className="border-2 border-red-200">
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Réservation Annulée
                    </h3>
                    {reservation.cancellation_reason && (
                      <p className="text-sm text-red-800 mb-2">
                        <strong>Raison :</strong> {reservation.cancellation_reason}
                      </p>
                    )}
                    <p className="text-xs text-red-600">
                      Annulée le {formatDateTime(reservation.cancelled_at)}
                    </p>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Price Summary */}
              <Card title="Récapitulatif" className="border-2 border-[#C9A961] shadow-xl">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B5D4F]">Sous-total</span>
                    <span className="font-medium text-[#2C2416]">{formatCurrency(reservation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B5D4F]">Taxes (19%)</span>
                    <span className="font-medium text-[#2C2416]">{formatCurrency(reservation.tax_amount)}</span>
                  </div>
                  {reservation.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Remise</span>
                      <span className="font-medium">-{formatCurrency(reservation.discount_amount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#EAE3D2] pt-3 flex justify-between">
                    <span className="font-bold text-[#2C2416]">Total</span>
                    <span className="font-bold text-xl text-[#C9A961]">{formatCurrency(reservation.total_amount)}</span>
                  </div>
                </div>
              </Card>

              {/* Payment Summary */}
              <PaymentSummary payments={payments} summary={summary} />

              {/* Payment Action */}
              {balanceDue > 0 && reservation.is_active && !isFullyPaid && (
                <Card className="bg-[#C9A961]/10 border-2 border-[#C9A961]">
                  <Button 
                    fullWidth 
                    variant="primary"
                    onClick={() => navigate(`/payments/${reservation.id}`)}
                    className="flex items-center justify-center gap-2"
                  >
                    <CreditCardIcon className="h-5 w-5" />
                    Effectuer un Paiement
                  </Button>
                  <p className="text-xs text-[#6B5D4F] text-center mt-3">
                    Reste à payer: <strong className="text-[#C9A961]">{formatCurrency(balanceDue)}</strong>
                  </p>
                </Card>
              )}

              {/* Payment Completed */}
              {isFullyPaid && (
                <Card className="bg-green-50 border-2 border-green-200">
                  <div className="text-center py-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="font-bold text-green-900 mb-1">Paiement Complet</p>
                    <p className="text-sm text-green-700">Cette réservation est entièrement payée</p>
                  </div>
                </Card>
              )}

              {/* Cancel Button */}
              {reservation.can_cancel && (
                <Card>
                  <Button 
                    fullWidth 
                    variant="danger"
                    onClick={() => setShowCancelModal(true)}
                  >
                    Annuler la Réservation
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        title="Annuler la Réservation"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={handleCloseCancelModal}
              disabled={isCancelling}
            >
              Non, Garder
            </Button>
            <Button 
              variant="danger" 
              onClick={handleCancel} 
              loading={isCancelling}
              disabled={isCancelling}
            >
              Oui, Annuler
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {cancelError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{cancelError}</p>
            </div>
          )}
          
          <p className="text-[#6B5D4F]">
            Êtes-vous sûr de vouloir annuler cette réservation ?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-[#2C2416] mb-2">
              Raison de l'annulation <span className="text-[#8B7965]">(optionnel)</span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              disabled={isCancelling}
              className="w-full px-4 py-3 border border-[#EAE3D2] rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Ex: Changement de plans..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationDetails;