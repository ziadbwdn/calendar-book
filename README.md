# Calendar Booking System

A modern calendar booking system built with **TypeScript**, **Express**, **Vite**, and **PostgreSQL**.

## Features

- **Organizer Dashboard**: Manage availability, working hours, and bookings
- **Public Booking Page**: Invitees can book meetings without authentication
- **Share Links**: Organizers can share unique booking links with invitees
- **Timezone Support**: Automatic timezone detection and conversion
- **Role-Based Access**: Separate workflows for organizers and invitees
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
.
├── server/          # Express.js backend + PostgreSQL
├── client/          # Vite + TypeScript frontend
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/calendar-booking.git
   cd calendar-booking
   ```

2. **Setup environment files:**
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Run with Docker Compose:**
   ```bash
   # From server directory
   cd server && docker-compose up -d

   # From client directory (in another terminal)
   cd client && docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

### Without Docker

**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## Deployment

### Railway

1. Set up separate services for `server` and `client`
2. Configure **Root Directory** for each service:
   - Server: `server`
   - Client: `client`
3. Set environment variables in Railway dashboard
4. Deploy

See individual `Dockerfile` in each directory for production builds.

## Environment Variables

### Server (`server/.env`)
```
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=changeme
DB_DATABASE=scheduler_db
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://your-domain.com
CLIENT_URL=https://your-domain.com
```

### Client (`client/.env`)
```
VITE_API_BASE_URL=https://your-api.railway.app/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Organizer
- `GET /api/organizer/settings` - Get settings
- `PUT /api/organizer/settings` - Update settings
- `GET /api/organizer/bookings` - List bookings
- `PATCH /api/organizer/bookings/:id` - Reschedule/cancel

### Public (No Auth)
- `GET /api/public/:organizerId/slots` - Get available slots
- `POST /api/public/:organizerId/book` - Create booking

## Technology Stack

**Backend:**
- Node.js 18
- Express.js
- TypeScript
- PostgreSQL 16
- TypeORM
- Luxon (timezone handling)
- JWT (authentication)

**Frontend:**
- Vite
- TypeScript
- Vanilla JavaScript (no framework)
- Nginx (production)

## Testing

### Manual Testing

1. Register as organizer
2. Configure availability settings
3. Share booking link
4. Book a meeting as invitee
5. Manage bookings in dashboard

### Test Scenarios

- Different timezones
- Minimum notice requirements
- Blackout dates
- Working hours constraints
- Concurrent bookings prevention

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- CORS protection
- Input validation
- XSS prevention
- Password hashing
- Environment variable secrets

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
