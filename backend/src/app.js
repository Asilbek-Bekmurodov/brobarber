require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const barberRoutes = require('./routes/barber.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => res.json({ message: 'Barbershop API running' }));

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server on port ${PORT}`));
}

module.exports = app;
