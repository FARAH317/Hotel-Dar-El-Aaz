import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createReservation, selectReservationLoading } from '../store/reservationSlice';
import { validateForm, calculateNights } from '@/utils/validators';
import { formatCurrency } from '@/utils/formatters';
import DatePicker from '@/components/DatePicker';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';

const ReservationForm = ({ room }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectReservationLoading);

  const [formData, setFormData] = useState({
    check_in_date: null,
    check_out_date: null,
    number_of_guests: 1,
    special_requests: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const nights = calculateNights(formData.check_in_date, formData.check_out_date);
  
  // Arrondir à 2 décimales
  const roundToTwo = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };
  
  const subtotal = roundToTwo(room.current_price * nights);
  const taxAmount = roundToTwo(subtotal * 0.19); // 19% TVA
  const totalAmount = roundToTwo(subtotal + taxAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm(formData, {
      check_in_date: { required: true },
      check_out_date: { required: true },
      number_of_guests: {
        required: true,
        validator: (value) => {
          if (value < 1) return 'Minimum 1 invité';
          if (value > room.room_type?.max_occupancy) {
            return `Maximum ${room.room_type.max_occupancy} invités`;
          }
          return null;
        },
      },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    const reservationData = {
      room_id: room.id,
      check_in_date: formData.check_in_date.toISOString().split('T')[0],
      check_out_date: formData.check_out_date.toISOString().split('T')[0],
      number_of_guests: parseInt(formData.number_of_guests),
      special_requests: formData.special_requests,
      guest_name: formData.guest_name,
      guest_email: formData.guest_email,
      guest_phone: formData.guest_phone,
    };

    const result = await dispatch(createReservation(reservationData));
    
    if (createReservation.fulfilled.match(result)) {
      navigate(`/reservations/${result.payload.reservation.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card title="Informations de réservation">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Date d'arrivée"
              selected={formData.check_in_date}
              onChange={(date) => handleChange('check_in_date', date)}
              minDate={new Date()}
              required
              error={errors.check_in_date}
            />

            <DatePicker
              label="Date de départ"
              selected={formData.check_out_date}
              onChange={(date) => handleChange('check_out_date', date)}
              minDate={formData.check_in_date || new Date()}
              required
              error={errors.check_out_date}
            />
          </div>

          <Input
            label="Nombre d'invités"
            type="number"
            name="number_of_guests"
            value={formData.number_of_guests}
            onChange={(e) => handleChange('number_of_guests', e.target.value)}
            min="1"
            max={room.room_type?.max_occupancy || 4}
            required
            error={errors.number_of_guests}
          />

          <Input
            label="Nom de l'invité principal (optionnel)"
            type="text"
            name="guest_name"
            value={formData.guest_name}
            onChange={(e) => handleChange('guest_name', e.target.value)}
            placeholder="Si différent du compte"
          />

          <Input
            label="Email (optionnel)"
            type="email"
            name="guest_email"
            value={formData.guest_email}
            onChange={(e) => handleChange('guest_email', e.target.value)}
          />

          <Input
            label="Téléphone (optionnel)"
            type="tel"
            name="guest_phone"
            value={formData.guest_phone}
            onChange={(e) => handleChange('guest_phone', e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Demandes spéciales (optionnel)
            </label>
            <textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={(e) => handleChange('special_requests', e.target.value)}
              rows={3}
              className="input"
              placeholder="Ex: Chambre non-fumeur, lit double..."
            />
          </div>
        </div>
      </Card>

      {/* Price Summary */}
      {nights > 0 && (
        <Card title="Récapitulatif" className="mt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(room.current_price)} x {nights} nuits</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA (19%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            className="mt-4"
          >
            Réserver maintenant
          </Button>
        </Card>
      )}
    </form>
  );
};

export default ReservationForm;