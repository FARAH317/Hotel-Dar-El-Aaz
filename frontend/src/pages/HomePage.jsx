import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  CreditCardIcon,
  StarIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/Button';
import { APP_NAME } from '@/utils/constants';

const HomePage = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'Luxe & Confort',
      description: 'Chambres élégantes avec équipements haut de gamme',
    },
    {
      icon: ClockIcon,
      title: 'Service 24/7',
      description: 'Notre équipe disponible à tout moment pour vous',
    },
    {
      icon: CreditCardIcon,
      title: 'Paiement Sécurisé',
      description: 'Transactions protégées et sécurisées',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Annulation Flexible',
      description: 'Politique d\'annulation souple et gratuite',
    },
    {
      icon: StarIcon,
      title: 'Meilleurs Tarifs',
      description: 'Prix garantis les plus compétitifs',
    },
    {
      icon: CheckCircleIcon,
      title: 'Réservation Facile',
      description: 'Processus simple et rapide en 3 étapes',
    },
  ];

  const stats = [
    { value: '250+', label: 'Chambres de Luxe', color: '#C9A961' },
    { value: '4.9', label: 'Note Moyenne', color: '#C9A961' },
    { value: '1500+', label: 'Clients Satisfaits', color: '#C9A961' },
  ];

  const experiences = [
    {
      icon: HomeModernIcon,
      title: 'Chambres & Suites',
      description: 'Des espaces élégants conçus pour votre confort absolu',
      count: '150+',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    },
    {
      icon: FireIcon,
      title: 'Restaurant Gastronomique',
      description: 'Cuisine raffinée préparée par nos chefs étoilés',
      count: '5 Étoiles',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
    },
    {
      icon: BuildingOffice2Icon,
      title: 'Spa & Wellness',
      description: 'Détendez-vous dans notre centre de bien-être luxueux',
      count: 'Premium',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Luxury */}
      <section 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 241, 232, 0.95) 0%, rgba(234, 227, 210, 0.9) 100%), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/50 via-transparent to-[#FDFBF7]"></div>
        
        <div className="relative luxury-container py-32 text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/20 px-4 py-2 rounded-full mb-6">
            <SparklesIcon className="h-4 w-4 text-[#C9A961]" />
            <span className="text-sm text-[#B8934A] font-medium uppercase tracking-wide">
              Luxury Hotel & Best Resort
            </span>
          </div>

          {/* Main Title */}
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-[#2C2416] mb-6 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Book The World's Best
            <br />
            <span className="text-[#C9A961]">Luxury Hotels</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-[#6B5D4F] max-w-2xl mx-auto mb-10 leading-relaxed">
            Découvrez l'excellence de l'hospitalité avec nos chambres luxueuses 
            et un service personnalisé incomparable.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/rooms">
              <Button size="lg" variant="primary" className="min-w-[200px]">
                Voir les Chambres
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Réserver Maintenant
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[#C9A961] rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-[#C9A961] rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="luxury-container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="section-title">Bienvenue à {APP_NAME}</span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Relax in Our Luxury Hotel Resort
            </h2>
            <div className="divider"></div>
            <p className="text-[#6B5D4F] leading-relaxed text-lg">
              Une expérience de séjour exceptionnelle vous attend avec nos installations 
              de classe mondiale, notre service attentionné et notre attention aux détails. 
              Chaque moment est conçu pour créer des souvenirs inoubliables.
            </p>
          </div>
        </div>
      </section>

      {/* Experiences Section - NOUVEAU avec photos */}
      <section className="py-24 bg-white">
        <div className="luxury-container">
          <div className="text-center mb-16">
            <span className="section-title">Découvrez Notre Univers</span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Expériences Uniques
            </h2>
            <div className="divider"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {experiences.map((exp, index) => (
              <div 
                key={index}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-96 overflow-hidden">
                  <img 
                    src={exp.image} 
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2416]/90 via-[#2C2416]/50 to-transparent"></div>
                  
                  {/* Badge */}
                  <div className="absolute top-6 right-6 bg-[#C9A961] text-white px-4 py-2 rounded-full text-sm font-bold">
                    {exp.count}
                  </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#C9A961] rounded-full flex items-center justify-center">
                      <exp.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 
                      className="text-2xl font-bold"
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {exp.title}
                    </h3>
                  </div>
                  <p className="text-[#EAE3D2] leading-relaxed mb-4">
                    {exp.description}
                  </p>
                  <button className="flex items-center gap-2 text-[#C9A961] font-medium hover:gap-4 transition-all">
                    En savoir plus
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant Showcase - NOUVEAU */}
      <section className="py-24 bg-[#F5F1E8]">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80" 
                  alt="Restaurant"
                  className="rounded-lg shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80" 
                  alt="Bar"
                  className="rounded-lg shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80" 
                  alt="Plat gastronomique"
                  className="rounded-lg shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80" 
                  alt="Restaurant intérieur"
                  className="rounded-lg shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="animate-fade-in">
              <span className="section-title">Gastronomie</span>
              <h2 
                className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Restaurant & Bar d'Exception
              </h2>
              <div className="w-16 h-1 bg-[#C9A961] mb-6"></div>
              <p className="text-[#6B5D4F] leading-relaxed mb-6 text-lg">
                Savourez une cuisine raffinée préparée par nos chefs primés. 
                Notre restaurant offre une expérience gastronomique inoubliable 
                avec des ingrédients frais et locaux.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Cuisine française et internationale</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Bar à cocktails premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Terrasse avec vue panoramique</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Service en chambre 24/7</span>
                </li>
              </ul>
              <Button variant="primary">
                Voir le Menu
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Views Showcase - NOUVEAU */}
      <section className="py-24 bg-white">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="order-2 lg:order-1 animate-fade-in">
              <span className="section-title">Nos Installations</span>
              <h2 
                className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Un Cadre d'Exception
              </h2>
              <div className="w-16 h-1 bg-[#C9A961] mb-6"></div>
              <p className="text-[#6B5D4F] leading-relaxed mb-6 text-lg">
                Notre hôtel offre des vues spectaculaires et des espaces conçus 
                pour votre bien-être. Profitez de notre piscine à débordement, 
                de notre spa luxueux et de nos jardins paisibles.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Piscine à débordement avec vue</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Spa & centre de bien-être</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Salle de fitness équipée</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-[#C9A961] flex-shrink-0 mt-1" />
                  <span className="text-[#6B5D4F]">Jardins méditerranéens</span>
                </li>
              </ul>
              <Button variant="secondary">
                Découvrir Plus
              </Button>
            </div>

            {/* Right - Images Grid */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img 
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80" 
                  alt="Piscine"
                  className="rounded-lg shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80" 
                  alt="Spa"
                  className="rounded-lg shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img 
                  src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80" 
                  alt="Lobby"
                  className="rounded-lg shadow-lg w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
                <img 
                  src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600&q=80" 
                  alt="Vue extérieure"
                  className="rounded-lg shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Luxury Grid */}
      <section className="py-20 bg-[#FDFBF7]">
        <div className="luxury-container">
          <div className="text-center mb-16">
            <span className="section-title">Nos Services</span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Pourquoi Nous Choisir ?
            </h2>
            <div className="divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-lg transition-all duration-300 hover:bg-[#FDFBF7] hover:shadow-xl hover:-translate-y-2 border border-[#EAE3D2]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-[#C9A961]/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#C9A961] transition-all duration-300">
                  <feature.icon className="h-8 w-8 text-[#C9A961] group-hover:text-white transition-colors" />
                </div>
                <h3 
                  className="text-xl font-semibold text-[#2C2416] mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {feature.title}
                </h3>
                <p className="text-[#6B5D4F] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Luxury */}
      <section 
        className="py-24 relative"
        style={{
          background: 'linear-gradient(135deg, #2C2416 0%, #1A1410 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #C9A961 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        <div className="relative luxury-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="mb-4">
                  <span 
                    className="text-6xl md:text-7xl font-bold"
                    style={{ 
                      fontFamily: 'Cormorant Garamond, serif',
                      background: `linear-gradient(135deg, ${stat.color} 0%, #E5D4A6 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
                <p className="text-[#EAE3D2] text-lg uppercase tracking-wider font-medium">
                  {stat.label}
                </p>
                <div className="w-12 h-1 bg-[#C9A961] mx-auto mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Luxury */}
      <section className="py-24 bg-[#F5F1E8]">
        <div className="luxury-container">
          <div className="max-w-4xl mx-auto text-center">
            <span className="section-title">Commencez Votre Voyage</span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Prêt à Réserver Votre Séjour ?
            </h2>
            <div className="divider"></div>
            <p className="text-lg text-[#6B5D4F] mb-10 leading-relaxed">
              Découvrez nos chambres exceptionnelles et trouvez celle qui correspond 
              parfaitement à vos besoins. Votre expérience de luxe commence ici.
            </p>
            <Link to="/rooms">
              <Button size="lg" variant="primary" className="group">
                Rechercher une Chambre
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-white">
        <div className="luxury-container">
          <div className="text-center mb-16">
            <span className="section-title">Témoignages</span>
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#2C2416] mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Ce Que Disent Nos Clients
            </h2>
            <div className="divider"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-[#FDFBF7] p-8 rounded-lg border border-[#EAE3D2] hover:shadow-xl transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-[#C9A961] text-[#C9A961]" />
                  ))}
                </div>
                <p className="text-[#6B5D4F] mb-6 leading-relaxed italic">
                  "Une expérience exceptionnelle du début à la fin. Le service est impeccable 
                  et les chambres sont magnifiques. Je recommande vivement !"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#C9A961] rounded-full"></div>
                  <div>
                    <p className="font-semibold text-[#2C2416]">Client {item}</p>
                    <p className="text-sm text-[#8B7965]">Voyageur Vérifié</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;