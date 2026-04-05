# allWays Backend API

Express + TypeScript + MongoDB backend for the allWays home services platform.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **Email**: Nodemailer (SMTP)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

3. Start MongoDB (make sure it's running locally or update MONGODB_URI)

4. Seed the database:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## Default Credentials

After seeding:
- **Admin**: admin@allways.com / admin123

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh tokens |
| GET | /api/auth/me | Get current user |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/services | No | Get all services |
| GET | /api/services/active | No | Get active services |
| POST | /api/services | Admin | Create service |
| PUT | /api/services/:id | Admin | Update service |
| DELETE | /api/services/:id | Admin | Delete service |

### Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/requests | User | Create request |
| GET | /api/requests | User/Admin | Get requests |
| PATCH | /api/requests/:id/status | Admin | Update status |

## Project Structure

```
src/
  ├── config/         # Configuration & DB connection
  ├── middlewares/     # Auth, validation, error handling
  ├── modules/
  │   ├── auth/       # Auth controller, routes, validation
  │   ├── users/      # User model
  │   ├── services/   # Service CRUD
  │   └── requests/   # Request management
  ├── utils/          # JWT, email, errors
  └── server.ts       # Entry point
```
