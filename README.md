# 🩸 LifeFlow - Blood Donation Management Platform

A full-stack MERN application connecting blood donors with patients in need.

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Axios, React Hot Toast, React Icons

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Bcrypt, Nodemailer

## Features

### Authentication & Roles
- JWT-based authentication with bcrypt password hashing
- Role-based access: Donor, Receiver, Hospital, Admin
- Profile management per role

### Donor Features
- Complete profile (blood group, age, medical info)
- Toggle availability status
- View nearby blood requests
- Accept and complete donation requests
- Donation history tracking

### Receiver Features
- Create blood requests with urgency levels
- Track request status in real-time
- View matched compatible donors
- Cancel pending requests

### Blood Matching Algorithm
- Compatible blood group matching
- Location-based donor suggestions
- Availability & eligibility checks
- 90-day donation gap enforcement

### Admin Features
- Dashboard with analytics & statistics
- User management (activate/deactivate, verify, delete)
- Blood request monitoring
- Hospital verification

### Hospital Features
- Profile & license management
- Blood inventory tracking
- Request monitoring
- Donation records

### Notification System
- In-app notifications
- Emergency alerts for urgent requests
- Real-time request/acceptance notifications

### Security
- Password hashing (bcrypt, 12 rounds)
- JWT token authentication
- Rate limiting
- Role-based middleware
- Input validation
- Secure API routes

## Project Structure

```
BloodDonation/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth & error handling
│   ├── utils/          # Helpers (blood match, email, token)
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Auth context
│   │   ├── services/   # API service layer
│   │   └── utils/      # Blood group utilities
│   └── public/
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file with:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/lifeflow
# JWT_SECRET=your_secret_key
# JWT_EXPIRE=7d

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on `http://localhost:5000`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Donors
- `GET /api/donors` - List donors (query: bloodGroup, city)
- `GET /api/donors/profile` - Get donor profile
- `PUT /api/donors/profile` - Update donor profile
- `PATCH /api/donors/toggle-availability` - Toggle availability
- `GET /api/donors/donation-history` - Get donation history
- `GET /api/donors/nearby-requests` - Get nearby requests
- `POST /api/donors/accept-request/:id` - Accept request
- `POST /api/donors/complete-donation/:id` - Complete donation

### Receivers
- `GET /api/receivers/profile` - Get receiver profile
- `PUT /api/receivers/profile` - Update receiver profile
- `POST /api/receivers/blood-request` - Create blood request
- `GET /api/receivers/my-requests` - List my requests
- `GET /api/receivers/matched-donors/:id` - Get matched donors
- `PATCH /api/receivers/cancel-request/:id` - Cancel request

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users
- `PATCH /api/admin/users/:id/toggle-status` - Toggle user status
- `PATCH /api/admin/users/:id/verify` - Verify user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/requests` - List all requests
- `GET /api/admin/hospitals` - List hospitals
- `PATCH /api/admin/hospitals/:id/verify` - Verify hospital

### Hospitals
- `GET /api/hospitals/profile` - Get hospital profile
- `PUT /api/hospitals/profile` - Update hospital profile
- `PATCH /api/hospitals/inventory` - Update blood inventory
- `GET /api/hospitals/requests` - Get hospital requests
- `GET /api/hospitals/donations` - Get hospital donations

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

## Database Models

- **User** - name, email, password, role, phone, city, address, isActive, isVerified
- **Donor** - user ref, age, gender, bloodGroup, weight, lastDonationDate, isAvailable, totalDonations
- **Receiver** - user ref, patientName, bloodGroup, quantityRequired, hospitalName, emergencyContact
- **BloodRequest** - receiver ref, patientName, bloodGroup, unitsRequired, hospital, urgency, status, matchedDonors
- **Donation** - donor ref, request ref, hospital ref, donationDate, bloodGroup, unitsDonated
- **Hospital** - user ref, hospitalName, licenseNumber, bloodInventory, isVerified
- **Notification** - user ref, type, title, message, isRead, isEmergency

## Deployment

- **Frontend:** Deploy to Vercel
- **Backend:** Deploy to Render/Railway
- **Database:** MongoDB Atlas
