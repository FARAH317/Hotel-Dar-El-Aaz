# Hotel Reservation System

A full-stack **Hotel Reservation System** with a **React + Vite frontend** and a **Django REST Framework backend**.  
It allows users to browse rooms, make reservations, process payments, and receive notifications, while admins can manage all hotel operations.

---

## Project Overview

This project is designed for managing hotel operations and reservations, providing:

- **User authentication & role-based access** (Admin, Staff, Customer)
- **Room management** (CRUD for rooms, types, and amenities)
- **Reservation management** with state transitions
- **Payment processing** (Stripe, PayPal, Cash)
- **Notifications** via email and SMS
- **Admin dashboard** with analytics and reports

---

## Tech Stack

### Backend
- Django 5.x, Django REST Framework
- PostgreSQL database
- JWT Authentication
- Celery for async tasks (email/SMS)
- Python 3.12

### Frontend
- React 19.x with Vite
- Redux for state management
- Tailwind CSS for styling
- Axios for API requests
- JavaScript (ES6+)

---

## Backend Structure

\\\
backend/
├── manage.py
├── requirements.txt
├── .env
│
├── config/                           # Configuration Django
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/
│   │
│   ├── core/                         # Code partagé
│   │   ├── models/
│   │   │   └── base.py              # Modèle de base (timestamps, etc.)
│   │   ├── exceptions.py            # Exceptions personnalisées
│   │   └── utils.py                 # Utilitaires communs
│   │
│   ├── users/                        # Utilisateurs & Auth
│   │   ├── models/
│   │   │   ├── user.py              # MTV Pattern
│   │   │   └── profile.py
│   │   ├── managers/
│   │   │   └── user_manager.py      # Repository Pattern
│   │   ├── services/
│   │   │   └── user_service.py      # Service Layer
│   │   ├── api/
│   │   │   ├── views.py             # ViewSets
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   └── admin.py
│   │
│   ├── rooms/                        # Chambres
│   │   ├── models/
│   │   │   ├── room.py              # MTV Pattern
│   │   │   ├── room_type.py
│   │   │   └── amenity.py
│   │   ├── managers/
│   │   │   └── room_manager.py      # Repository Pattern
│   │   ├── services/
│   │   │   ├── room_service.py      # Service Layer
│   │   │   └── availability_service.py
│   │   ├── api/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   └── admin.py
│   │
│   ├── reservations/                 # Réservations (CŒUR DU SYSTÈME)
│   │   ├── models/
│   │   │   └── reservation.py       # MTV Pattern
│   │   ├── managers/
│   │   │   └── reservation_manager.py  # Repository Pattern
│   │   ├── services/
│   │   │   ├── reservation_service.py  # Service Layer + Unit of Work
│   │   │   ├── pricing_service.py      # Strategy Pattern (Tarification)
│   │   │   └── states/                 # State Pattern
│   │   │       ├── __init__.py
│   │   │       ├── base_state.py
│   │   │       ├── pending_state.py
│   │   │       ├── confirmed_state.py
│   │   │       ├── checked_in_state.py
│   │   │       ├── checked_out_state.py
│   │   │       └── cancelled_state.py
│   │   ├── api/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── signals.py                  # Observer Pattern
│   │   └── admin.py
│   │
│   ├── payments/                     # Paiements
│   │   ├── models/
│   │   │   ├── payment.py           # MTV Pattern
│   │   │   └── invoice.py
│   │   ├── managers/
│   │   │   └── payment_manager.py   # Repository Pattern
│   │   ├── services/
│   │   │   ├── payment_service.py   # Service Layer + Unit of Work
│   │   │   └── strategies/          # Strategy Pattern (Paiement)
│   │   │       ├── __init__.py
│   │   │       ├── base_strategy.py
│   │   │       ├── stripe_strategy.py
│   │   │       ├── paypal_strategy.py
│   │   │       └── cash_strategy.py
│   │   ├── api/
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   └── admin.py
│   │
│   └── notifications/                # Notifications
│       ├── models/
│       │   └── notification.py
│       ├── services/
│       │   └── notification_service.py  # Observer Pattern
│       ├── tasks.py                     # Celery tasks (email, SMS)
│       └── api/
│           ├── views.py
│           └── urls.py
│
├── infrastructure/                   # Services externes
│   ├── email/
│   │   └── email_service.py         # Service email simple
│   └── sms/
│       └── sms_service.py           # Service SMS simple
│
└── static/
\\\

---

## Frontend Structure

\\\
frontend/
├── public/
│   └── index.html
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── store.js                  # Redux store (state global)
│   │   └── routes.jsx                # React Router
│   │
│   ├── features/                     # Organisation par fonctionnalité
│   │   │
│   │   ├── auth/                     # Authentification
│   │   │   ├── components/           # Component Pattern
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── RegisterForm.jsx
│   │   │   ├── services/
│   │   │   │   └── authService.js    # Appels API
│   │   │   └── store/
│   │   │       └── authSlice.js      # Redux slice
│   │   │
│   │   ├── rooms/                    #  Chambres
│   │   │   ├── components/           # Component Pattern
│   │   │   │   ├── RoomList.jsx
│   │   │   │   ├── RoomCard.jsx
│   │   │   │   ├── RoomDetails.jsx
│   │   │   │   └── RoomSearch.jsx
│   │   │   ├── services/
│   │   │   │   └── roomService.js
│   │   │   └── store/
│   │   │       └── roomSlice.js
│   │   │
│   │   ├── reservations/             # Réservations
│   │   │   ├── components/           # Component Pattern
│   │   │   │   ├── ReservationForm.jsx
│   │   │   │   ├── ReservationList.jsx
│   │   │   │   ├── ReservationCard.jsx
│   │   │   │   └── ReservationDetails.jsx
│   │   │   ├── services/
│   │   │   │   └── reservationService.js
│   │   │   └── store/
│   │   │       └── reservationSlice.js
│   │   │
│   │   ├── payments/                 # Paiements
│   │   │   ├── components/           # Component Pattern
│   │   │   │   ├── PaymentForm.jsx
│   │   │   │   └── PaymentSummary.jsx
│   │   │   ├── services/
│   │   │   │   └── paymentService.js
│   │   │   └── store/
│   │   │       └── paymentSlice.js
│   │   │
│   │   └── dashboard/                # Dashboard Admin
│   │       ├── components/           # Component Pattern
│   │       │   ├── Dashboard.jsx
│   │       │   ├── StatsCard.jsx
│   │       │   └── RecentReservations.jsx
│   │       └── services/
│   │           └── dashboardService.js
│   │
│   ├── components/                   # Composants réutilisables
│   │   ├── Button.jsx               # Component Pattern
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── DatePicker.jsx
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   │
│   ├── services/                     # Services globaux
│   │   └── api/
│   │       ├── apiClient.js         # Axios configuration
│   │       └── endpoints.js         # API endpoints
│   │
│   ├── utils/                        # Utilitaires
│   │   ├── validators.js
│   │   ├── formatters.js
│   │   └── constants.js
│   │
│   ├── styles/                       # Styles
│   │   └── index.css                # Tailwind CSS
│   │
│   └── assets/                       # Images, icons
│
├── package.json
├── tailwind.config.js
├── vite.config.js
└── .env
\\\

---

## Setup Instructions

### Backend

\\\bash
# Create virtual environment
python -m venv venv

# Activate
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Migrate database
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
\\\

### Frontend

\\\bash
# Install dependencies
npm install

# Start dev server
npm run dev
\\\

---

## Environment Variables

Create .env files in both backend/ and frontend/ with necessary secrets:

**Backend**
\\\
DEBUG=True
SECRET_KEY=<your_secret_key>
DATABASE_URL=postgres://user:password@localhost:5432/hotel_db
EMAIL_HOST=smtp.example.com
EMAIL_USER=<email>
EMAIL_PASSWORD=<password>
\\\

**Frontend**
\\\
VITE_API_URL=https://hotel-dar-el-aaz.onrender.com/api
\\\

---

## Contributing

- Fork the repository  
- Create a feature branch (\git checkout -b feature/my-feature\)  
- Commit changes (\git commit -m "Add feature"\)  
- Push branch (\git push origin feature/my-feature\)  
- Open a pull request  

---


