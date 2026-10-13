# MediCita Backend

REST API built with Node.js, Express, and MySQL. The code follows the project layers: `routes/` handles HTTP requests, `dao/` contains SQL access, `services/mysql.service.js` provides the shared connection pool, and `env/mysqlConfig.js` reads database configuration.

## Requirements

- Node.js 18 or newer
- MySQL 8.0.16 or newer (the schema uses enforced `CHECK` constraints)

## Setup

1. Create the database and tables by running `medicitas.sql` in MySQL.
2. Copy `.env.example` to `.env` and set the database credentials and a random `JWT_SECRET` of at least 32 characters.
3. Install dependencies with `npm install`.
4. Start the API with `npm start`. The default port is `5000`.

The API does not serve frontend application files. Interactive API documentation is available at `/api-docs`. `GET /api/health` checks the database connection.

## Initial admin account

Public registration always creates a patient (`user_role = '2'`). To create the first administrator, temporarily add `ADMIN_FIRST_NAMES`, `ADMIN_LAST_NAMES`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` to `.env`. Use a password with at least 12 characters, then run `npm run create-admin`. Remove `ADMIN_PASSWORD` from `.env` after the account is created. Admin accounts are never created through the public API.

Roles are `1 = admin` and `2 = patient`.

## API documentation

Open `/api-docs` while the API is running to browse the OpenAPI documentation and try requests interactively. Protected operations use a Bearer token returned by registration or login.

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

Send the JWT returned by registration or login as `Authorization: Bearer <token>` for protected endpoints. Request fields and public authentication users use English camelCase. DAO-backed response records expose the selected database columns in English snake_case.

## Request examples

Register a patient:

```json
{
  "firstNames": "Alex",
  "lastNames": "Morgan",
  "email": "alex@example.com",
  "password": "a-long-password",
  "phone": "555-0100"
}
```

Book an appointment (database-local time):

```json
{
  "doctorId": 1,
  "appointmentDatetime": "2026-11-02 09:30:00",
  "reason": "Annual checkup"
}
```

## Known schema constraints

- A doctor can have one schedule interval per weekday, Monday through Friday.
- Appointment uniqueness prevents duplicate start times, but appointment duration and overlapping intervals are not modeled.
- Exam reference ranges, review tags, and waiting time are not represented in the current schema.
- Income reports total completed appointments by their recorded `appointment_fee`; separate payment transactions are not modeled."# medicita" 
"# medicita" 
