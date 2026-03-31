import { Link } from 'react-router-dom';
import RoomDetails from '@/features/rooms/components/RoomDetails';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const RoomDetailPage = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Breadcrumb & Back Button */}
      <section className="py-6 bg-white border-b border-[#EAE3D2]">
        <div className="luxury-container">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                to="/" 
                className="text-[#8B7965] hover:text-[#C9A961] transition-colors"
              >
                Accueil
              </Link>
              <span className="text-[#8B7965]">/</span>
              <Link 
                to="/rooms" 
                className="text-[#8B7965] hover:text-[#C9A961] transition-colors"
              >
                Chambres
              </Link>
              <span className="text-[#8B7965]">/</span>
              <span className="text-[#2C2416] font-medium">Détails</span>
            </nav>

            {/* Back Button */}
            <Link 
              to="/rooms"
              className="flex items-center gap-2 text-[#6B5D4F] hover:text-[#C9A961] transition-colors group"
            >
              <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour aux chambres</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Room Details Component */}
      <section className="py-12">
        <div className="luxury-container">
          <RoomDetails />
        </div>
      </section>

      {/* Similar Rooms Section (Optional) */}
      <section className="py-16 bg-white">
        <div className="luxury-container">
          <div className="text-center mb-12">
            <span className="section-title">Découvrez Aussi</span>
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#2C2416] mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Chambres Similaires
            </h2>
            <div className="divider"></div>
          </div>

          {/* Placeholder for similar rooms - You can add a component here */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#EAE3D2]"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={`https://images.unsplash.com/photo-161877392812${item}-c32242e63f39?w=600&q=80`}
                    alt={`Chambre ${item}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-[#C9A961] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Premium
                  </div>
                </div>
                <div className="p-6">
                  <h3 
                    className="text-xl font-semibold text-[#2C2416] mb-2"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    Suite Deluxe {item}
                  </h3>
                  <p className="text-[#6B5D4F] text-sm mb-4">
                    Chambre spacieuse avec vue panoramique
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-[#C9A961]">
                        150€
                      </span>
                      <span className="text-[#8B7965] text-sm"> / nuit</span>
                    </div>
                    <Link to={`/rooms/${item}`} className="btn-secondary text-xs px-4 py-2">
                      Voir Détails
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-[#F5F1E8]">
        <div className="luxury-container max-w-4xl">
          <div className="text-center mb-12">
            <span className="section-title">Questions Fréquentes</span>
            <h2 
              className="text-3xl md:text-4xl font-bold text-[#2C2416] mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Besoin d'Informations ?
            </h2>
            <div className="divider"></div>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Quelle est l'heure d'arrivée et de départ ?",
                a: "L'arrivée se fait à partir de 15h00 et le départ avant 11h00. Un départ tardif peut être arrangé selon disponibilité."
              },
              {
                q: "Le petit-déjeuner est-il inclus ?",
                a: "Le petit-déjeuner buffet est inclus dans toutes nos suites premium. Pour les autres chambres, il est disponible en supplément."
              },
              {
                q: "Y a-t-il un parking disponible ?",
                a: "Oui, nous offrons un parking gratuit et sécurisé pour tous nos clients."
              },
              {
                q: "Puis-je annuler ma réservation ?",
                a: "Oui, vous pouvez annuler gratuitement jusqu'à 48h avant votre arrivée. Consultez nos conditions pour plus de détails."
              }
            ].map((faq, index) => (
              <details 
                key={index}
                className="group bg-white rounded-lg border border-[#EAE3D2] overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#FDFBF7] transition-colors">
                  <h3 
                    className="text-lg font-semibold text-[#2C2416] pr-4"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {faq.q}
                  </h3>
                  <svg 
                    className="h-5 w-5 text-[#C9A961] flex-shrink-0 group-open:rotate-180 transition-transform" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6">
                  <p className="text-[#6B5D4F] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="luxury-container text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold text-[#2C2416] mb-4"
            style={{ fontFamily: 'Cormoant Garamond, serif' }}
          >
            Des Questions ? Contactez-nous
          </h2>
          <p className="text-[#6B5D4F] mb-8 max-w-2xl mx-auto">
            Notre équipe est disponible 24/7 pour répondre à toutes vos questions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+213560990863" className="btn-primary">
              📞 0560 99 08 63
            </a>
            <a href="mailto:contact@hoteldarelaaz.com" className="btn-secondary">
              ✉️ contact@hoteldarelaaz.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomDetailPage;