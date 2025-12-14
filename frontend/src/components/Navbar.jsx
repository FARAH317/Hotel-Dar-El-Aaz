import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  HomeIcon,
  CalendarIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { logout, selectUser, selectIsAuthenticated } from '@/features/auth/store/authSlice';
import { APP_NAME, USER_ROLES } from '@/utils/constants';
import NotificationDropdown from '@/features/notifications/components/NotificationDropdown';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navigation = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Chambres', href: '/rooms', icon: HomeIcon },
    ...(isAuthenticated ? [
      { name: 'Mes Réservations', href: '/my-reservations', icon: CalendarIcon },
      { name: 'Mes Paiements', href: '/my-payments', icon: CreditCardIcon },
    ] : []),
    ...(user?.role === USER_ROLES.ADMIN ? [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    ] : []),
  ];

  return (
    <nav className={`luxury-navbar ${isScrolled ? 'scrolled' : ''} py-5`}>
      <div className="luxury-container">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="luxury-logo">
            <div className="text-[#C9A961]">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 5L25 15L35 15L27.5 22.5L30 32.5L20 25L10 32.5L12.5 22.5L5 15L15 15L20 5Z" 
                      fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-wider">{APP_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-10">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link to={item.href} className="luxury-nav-link">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side - Auth */}
          <div className="flex items-center space-x-5">
            {isAuthenticated ? (
              <>
                {/* Notifications - Remplace l'ancien bouton par le nouveau dropdown */}
                <NotificationDropdown />

                {/* User Menu */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center space-x-2 text-[#6B5D4F] hover:text-[#C9A961] px-3 py-2 rounded-md hover:bg-[#F5F1E8] transition-all">
                    <UserCircleIcon className="h-7 w-7" />
                    <span className="hidden md:block text-sm font-medium">
                      {user?.first_name}
                    </span>
                  </Menu.Button>

                  <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-white rounded-lg shadow-xl border border-[#EAE3D2] focus:outline-none overflow-hidden">
                    <div className="py-2">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/profile"
                            className={`${
                              active ? 'bg-[#F5F1E8] text-[#C9A961]' : 'text-[#2C2416]'
                            } block px-4 py-3 text-sm font-medium transition-colors`}
                          >
                            Mon Profil
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/notifications"
                            className={`${
                              active ? 'bg-[#F5F1E8] text-[#C9A961]' : 'text-[#2C2416]'
                            } block px-4 py-3 text-sm font-medium transition-colors`}
                          >
                            Notifications
                          </Link>
                        )}
                      </Menu.Item>
                      <div className="border-t border-[#EAE3D2]"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-[#F5F1E8] text-[#C9A961]' : 'text-[#2C2416]'
                            } block w-full text-left px-4 py-3 text-sm font-medium transition-colors`}
                          >
                            Déconnexion
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Menu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="btn-secondary text-sm">
                  Connexion
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Inscription
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-[#6B5D4F] hover:text-[#C9A961] hover:bg-[#F5F1E8] transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EAE3D2] mt-5 bg-white/95 backdrop-blur-lg">
          <div className="luxury-container py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block px-4 py-3 rounded-md text-base font-medium text-[#6B5D4F] hover:text-[#C9A961] hover:bg-[#F5F1E8] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="block px-4 py-3 rounded-md text-base font-medium text-[#6B5D4F] hover:text-[#C9A961] hover:bg-[#F5F1E8] transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Notifications
              </Link>
            )}
            
            {!isAuthenticated && (
              <div className="pt-4 border-t border-[#EAE3D2] space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-md text-base font-medium text-[#6B5D4F] hover:text-[#C9A961] hover:bg-[#F5F1E8] transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block text-center btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;