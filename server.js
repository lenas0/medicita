require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi');
const pool = require('./services/mysql.service');
const authRoutes = require('./routes/auth.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const reviewRoutes = require('./routes/review.routes');
const examRoutes = require('./routes/exam.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get('/api/health', async (request, response, next) => {
  try {
    await pool.query('SELECT 1');
    return response.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);

app.use((request, response) => {
  response.status(404).json({ error: 'Route not found.' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  if (error.code === 'ER_DUP_ENTRY') {
    return response.status(409).json({ error: 'A record with this value already exists.' });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
  return response.status(500).json({ error: 'Internal server error.' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`MediCita API listening on port ${port}`);
});