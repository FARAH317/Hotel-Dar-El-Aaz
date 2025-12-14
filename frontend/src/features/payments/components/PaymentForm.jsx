import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPayment, processPayment, selectPaymentLoading } from '../store/paymentSlice';
import { PAYMENT_METHODS } from '@/utils/constants';
import { formatCurrency } from '@/utils/formatters';
import Select from '@/components/Select';
import Input from '@/components/Input';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import paymentService from '../services/paymentService';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentForm = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoading = useSelector(selectPaymentLoading);

  const [reservation, setReservation] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [loadingReservation, setLoadingReservation] = useState(true);

  const [paymentData, setPaymentData] = useState({
    payment_method: 'CASH',
    amount: 0,
    notes: '',
    // Champs carte
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
    // Champs CCP
    ccp_number: '',
    ccp_key: '',
    transaction_ref: '',
  });

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoadingReservation(true);
        // Récupérer les infos de paiement de la réservation
        const data = await paymentService.getPaymentsByReservation(reservationId);
        
        if (data) {
          setReservation(data.reservation);
          setPaymentSummary(data.summary);
          
          // Définir le montant par défaut = reste à payer
          const balanceDue = data.summary?.balance_due || data.reservation?.total_amount || 0;
          setPaymentData(prev => ({ 
            ...prev, 
            amount: balanceDue
          }));
        }
      } catch (err) {
        console.error(err);
        toast.error('Impossible de charger la réservation');
      } finally {
        setLoadingReservation(false);
      }
    };

    fetchReservation();
  }, [reservationId]);

  const handleChange = (field, value) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservation) return;

    // Validation du montant
    const amount = parseFloat(paymentData.amount);
    const balanceDue = paymentSummary?.balance_due || reservation.total_amount;
    
    if (amount <= 0) {
      toast.error('Le montant doit être positif');
      return;
    }
    
    if (amount > balanceDue) {
      toast.error(`Le montant ne peut pas dépasser ${formatCurrency(balanceDue)}`);
      return;
    }

    try {
      // 1️⃣ Créer le paiement
      const paymentPayload = {
        reservation_id: reservation.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        payment_type: 'FULL',
        notes: paymentData.notes || '',
      };
      
      console.log('🔍 Creating payment with data:', paymentPayload);
      
      const createResult = await dispatch(createPayment(paymentPayload));

      if (createPayment.fulfilled.match(createResult)) {
        const payment = createResult.payload.payment;

        // 2️⃣ Traiter le paiement selon la méthode
        if (['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CCP'].includes(paymentData.payment_method)) {
          
          const processData = { notes: paymentData.notes };
          
          // Ajouter les infos spécifiques selon la méthode
          if (paymentData.payment_method === 'CREDIT_CARD' || paymentData.payment_method === 'DEBIT_CARD') {
            processData.card_number = paymentData.card_number;
            processData.card_expiry = paymentData.card_expiry;
            processData.card_cvv = paymentData.card_cvv;
            processData.card_name = paymentData.card_name;
          }
          
          if (paymentData.payment_method === 'CCP') {
            processData.ccp_number = paymentData.ccp_number;
            processData.ccp_key = paymentData.ccp_key;
            processData.transaction_ref = paymentData.transaction_ref;
          }

          const processResult = await dispatch(processPayment({
            id: payment.id,
            paymentData: processData,
          }));

          if (processPayment.fulfilled.match(processResult)) {
            dispatch(fetchUnreadNotifications());
            dispatch(fetchNotificationCounts());
            // ✅ Rediriger vers la page de confirmation
            toast.success('Paiement effectué avec succès !');
            navigate(`/payment-confirmation/${payment.id}`);
          } else {
            toast.error('Erreur lors du traitement du paiement');
          }
        } else {
          // Pour Stripe/PayPal : redirection vers passerelle externe
          toast.info('Redirection vers la passerelle de paiement...');
          // TODO: Implémenter la redirection Stripe/PayPal
        }
      } else {
        toast.error('Erreur lors de la création du paiement');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du paiement');
    }
  };

  if (loadingReservation) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <p className="text-[#6B5D4F] text-lg">Chargement de la réservation...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#2C2416] text-xl mb-4">Réservation introuvable</p>
          <Button onClick={() => navigate('/my-reservations')}>
            Retour aux réservations
          </Button>
        </div>
      </div>
    );
  }

  const paymentMethodOptions = Object.values(PAYMENT_METHODS).map(method => ({
    value: method.value,
    label: method.label,
  }));

  const totalPaid = paymentSummary?.total_paid || 0;
  const balanceDue = paymentSummary?.balance_due || reservation.total_amount;

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold text-[#2C2416] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Effectuer un Paiement
          </h1>
          <div className="h-1 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent"></div>
          <p className="mt-4 text-[#6B5D4F]">
            Réservation <span className="font-semibold">{reservation.reservation_number}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border-2 border-[#EAE3D2] p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Méthode de paiement */}
                <Select
                  label="Méthode de paiement"
                  name="payment_method"
                  value={paymentData.payment_method}
                  onChange={(e) => handleChange('payment_method', e.target.value)}
                  options={paymentMethodOptions}
                  required
                />

                {/* Champs conditionnels selon la méthode */}
                {(paymentData.payment_method === 'CREDIT_CARD' || paymentData.payment_method === 'DEBIT_CARD') && (
                  <div className="space-y-4 p-4 bg-[#F5F1E8] rounded-lg border border-[#EAE3D2]">
                    <h3 className="font-semibold text-[#2C2416]">💳 Informations de la carte</h3>
                    
                    <Input
                      label="Nom sur la carte"
                      type="text"
                      value={paymentData.card_name}
                      onChange={(e) => handleChange('card_name', e.target.value.toUpperCase())}
                      placeholder="BENALI MOHAMMED"
                      required
                    />
                    
                    <Input
                      label="Numéro de carte"
                      type="text"
                      value={paymentData.card_number}
                      onChange={(e) => handleChange('card_number', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiration"
                        type="text"
                        value={paymentData.card_expiry}
                        onChange={(e) => handleChange('card_expiry', e.target.value)}
                        placeholder="MM/AA"
                        maxLength="5"
                        required
                      />
                      
                      <Input
                        label="CVV"
                        type="password"
                        value={paymentData.card_cvv}
                        onChange={(e) => handleChange('card_cvv', e.target.value)}
                        placeholder="•••"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentData.payment_method === 'CCP' && (
                  <div className="space-y-4 p-4 bg-[#F5F1E8] rounded-lg border border-[#EAE3D2]">
                    <h3 className="font-semibold text-[#2C2416]">📮 Informations CCP</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Numéro CCP"
                        type="text"
                        value={paymentData.ccp_number}
                        onChange={(e) => handleChange('ccp_number', e.target.value)}
                        placeholder="1234567890"
                        required
                      />
                      
                      <Input
                        label="Clé"
                        type="text"
                        value={paymentData.ccp_key}
                        onChange={(e) => handleChange('ccp_key', e.target.value)}
                        placeholder="12"
                        maxLength="2"
                        required
                      />
                    </div>
                    
                    <Input
                      label="Référence de transaction"
                      type="text"
                      value={paymentData.transaction_ref}
                      onChange={(e) => handleChange('transaction_ref', e.target.value)}
                      placeholder="REF123456789"
                      required
                    />
                  </div>
                )}

                <Input
                  label="Montant"
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={(e) => handleChange('amount', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-[#2C2416] mb-1">
                    Notes (optionnel)
                  </label>
                  <textarea
                    name="notes"
                    value={paymentData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-[#EAE3D2] rounded-lg focus:border-[#C9A961] focus:outline-none"
                    placeholder="Informations supplémentaires..."
                  />
                </div>

                <Button type="submit" fullWidth loading={isLoading}>
                  Confirmer le paiement
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar récapitulatif */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border-2 border-[#EAE3D2] p-6 sticky top-6">
              <h3 
                className="text-xl font-bold text-[#2C2416] mb-4"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Récapitulatif
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B5D4F]">Total réservation</span>
                  <span className="font-semibold">{formatCurrency(reservation.total_amount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B5D4F]">Déjà payé</span>
                  <span className="font-semibold text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B5D4F]">Reste à payer</span>
                  <span className="font-semibold text-orange-600">{formatCurrency(balanceDue)}</span>
                </div>
                
                <div className="border-t-2 border-[#EAE3D2] pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#2C2416]">Montant à payer</span>
                    <span 
                      className="text-2xl font-bold text-[#C9A961]"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {formatCurrency(paymentData.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;