import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, selectAuthLoading, selectAuthError } from '../store/authSlice';
import { validateForm } from '@/utils/validators';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm(formData, {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        password: true,
      },
      password_confirm: {
        required: true,
        validator: (value, values) => {
          if (value !== values.password) {
            return 'Les mots de passe ne correspondent pas';
          }
          return null;
        },
      },
      first_name: {
        required: true,
        minLength: 2,
      },
      last_name: {
        required: true,
        minLength: 2,
      },
      phone: {
        required: false,
        phone: true,
      },
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await dispatch(register(formData));
    
    if (register.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A961] rounded-full mb-4">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <h2 
            className="text-4xl font-bold text-[#2C2416] mb-2"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Créer un Compte
          </h2>
          <p className="text-[#6B5D4F]">
            Rejoignez-nous pour une expérience de luxe
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-2xl border-2 border-[#EAE3D2] p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[#2C2416] mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#8B7965]" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                      errors.first_name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                    }`}
                    placeholder="Ahmed"
                  />
                </div>
                {errors.first_name && (
                  <p className="mt-2 text-xs text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[#2C2416] mb-2">
                  Nom
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#8B7965]" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                      errors.last_name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                    }`}
                    placeholder="Benali"
                  />
                </div>
                {errors.last_name && (
                  <p className="mt-2 text-xs text-red-600">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2C2416] mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-[#8B7965]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#2C2416] mb-2">
                Téléphone <span className="text-[#8B7965] text-xs">(optionnel)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-[#8B7965]" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                    errors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                  }`}
                  placeholder="+213 555 12 34 56"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#2C2416] mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-[#8B7965]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="password_confirm" className="block text-sm font-medium text-[#2C2416] mb-2">
                  Confirmer
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-[#8B7965]" />
                  </div>
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    autoComplete="new-password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-sm bg-white text-[#2C2416] placeholder-[#8B7965] transition-all duration-200 focus:outline-none ${
                      errors.password_confirm 
                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                        : 'border-[#EAE3D2] focus:border-[#C9A961] focus:ring-2 focus:ring-[#E5D4A6]/30'
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.password_confirm && (
                  <p className="mt-2 text-xs text-red-600">{errors.password_confirm}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription...
                  </span>
                ) : (
                  "Créer mon Compte"
                )}
              </button>
            </div>

            {/* Terms */}
            <div className="text-xs text-center text-[#8B7965]">
              En vous inscrivant, vous acceptez nos{' '}
              <a href="#" className="text-[#C9A961] hover:text-[#B8934A] underline">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="#" className="text-[#C9A961] hover:text-[#B8934A] underline">
                politique de confidentialité
              </a>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-[#6B5D4F]">
          Vous avez déjà un compte ?{' '}
          <Link 
            to="/login" 
            className="font-medium text-[#C9A961] hover:text-[#B8934A] transition-colors underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;