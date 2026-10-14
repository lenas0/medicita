# MediCita Backend

MediCita is a REST API for a medical appointment management system built with Node.js, Express, and MySQL. It supports patient registration, authentication, doctor management, appointment booking, reviews, exams, and admin reporting.

## Features

- User registration and login with JWT authentication
- Role-based access control for patients and administrators
- Doctor catalog and schedule management
- Appointment creation, cancellation, and status updates
- Patient review submission for completed appointments
- Exam management associated with appointments
- Admin reporting for patients and income
- OpenAPI-compatible documentation at `/api-docs`

## Project structure

- `routes/` — HTTP route definitions
- `dao/` — data access layer and SQL queries
- `services/` — service logic and shared infrastructure
- `env/` — environment configuration loader
- `scripts/` — helper scripts such as admin bootstrap
- `server.js` — application entry point
- `medicitas.sql` — database schema and seed definitions

## Requirements

- Node.js 18 or newer
- MySQL 8.0.16 or newer
- npm

## Environment configuration

Create a local `.env` file in the project root. This file must not be committed to source control because it contains environment-specific values and secrets.

The repository includes `.env.example` as the base template. It is intentionally kept in version control so other developers can copy it and configure their own local settings without exposing real credentials.

Example:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=medicita
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters
JWT_EXPIRES_IN=8h
```

For the initial administrator bootstrap, temporarily add the following values to `.env` before running the creation script:

```env
ADMIN_FIRST_NAMES=admin
ADMIN_LAST_NAMES=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123!
```

After the first administrator account is created, remove `ADMIN_PASSWORD` from `.env` and keep the remaining runtime configuration only.

## Setup

1. Create the database schema by importing `medicitas.sql` into MySQL.
2. Create `.env` from `.env.example` and set your local values.
3. Install dependencies:

```bash
npm install
```

4. Start the API:

```bash
npm start
```

The default port is `5000`.

## Initial administrator

Public registration always creates a patient account (`user_role = '2'`). To create the first administrator, add the `ADMIN_*` variables to `.env`, then run:

```bash
npm run create-admin
```

This script creates the initial admin account in the database. The generated admin user is not created through the public API and should be treated as a one-time bootstrap step.

Roles:
- `1 = admin`
- `2 = patient`

## API documentation

Once the server is running, open the Swagger/OpenAPI documentation in the browser:

```text
http://localhost:5000/api-docs
```

The API exposes interactive documentation for testing endpoints. Protected requests require a JWT returned by registration or login.

## Authentication

After registering or logging in, send the returned token as:

```http
Authorization: Bearer <token>
```

Request fields for public authentication endpoints use English camelCase. DAO-backed response records expose database fields in English snake_case.

## API endpoints

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public; creates a patient |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `GET` | `/api/doctors` | Public; active doctors |
| `GET` | `/api/doctors/:doctorId` | Public |
| `GET` | `/api/doctors/:doctorId/schedules` | Public |
| `POST` | `/api/doctors` | Admin |
| `PUT` | `/api/doctors/:doctorId` | Admin |
| `POST` | `/api/doctors/:doctorId/schedules` | Admin |
| `POST` | `/api/appointments` | Patient |
| `GET` | `/api/appointments/me` | Patient; own appointments |
| `PATCH` | `/api/appointments/:appointmentId/cancel` | Patient; own scheduled appointment |
| `GET` | `/api/appointments/admin/today` | Admin |
| `PATCH` | `/api/appointments/:appointmentId/status` | Admin; scheduled appointment |
| `GET` | `/api/reviews/doctor/:doctorId` | Public |
| `POST` | `/api/reviews/appointments/:appointmentId` | Patient; own completed appointment |
| `GET` | `/api/exams/appointments/:appointmentId` | Patient; own appointment |
| `POST` | `/api/exams` | Admin |
| `GET` | `/api/admin/patients` | Admin |
| `GET` | `/api/admin/reports/income?from=YYYY-MM-DD&to=YYYY-MM-DD` | Admin |

## Request examples

### Register a patient

```json
{
  "firstNames": "Alex",
  "lastNames": "Morgan",
  "email": "alex@example.com",
  "password": "a-long-password",
  "phone": "555-0100"
}
```

### Book an appointment

```json
{
  "doctorId": 1,
  "appointmentDatetime": "2026-11-02 09:30:00",
  "reason": "Annual checkup"
}
```

## Health check

```bash
curl http://localhost:5000/api/health
```

This endpoint verifies the database connection status.

## Known schema constraints

- A doctor can have one schedule interval per weekday from Monday to Friday.
- Appointment uniqueness prevents duplicate start times, but overlapping intervals and duration logic are not fully modeled.
- Exam reference ranges, review tags, and waiting time are not represented in the current schema.
- Income reports total completed appointments by their recorded `appointment_fee`; separate payment transactions are not modeled.

## Notes

- Keep `.env` local and never commit it to the repository.
- The project intentionally provides `.env.example` as a portable, secure template.
- Use strong credentials and rotate secrets in production environments.

