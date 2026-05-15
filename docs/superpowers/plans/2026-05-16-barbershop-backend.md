# Barbershop Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js + MongoDB REST API for a barbershop app with Admin/Barber/User roles, JWT auth, booking system, and Swagger docs.

**Architecture:** Single `users` collection with role discriminator (admin/barber/user). Separate `services` and `bookings` collections. JWT access tokens for auth. Phone validation: `+998XXXXXXXXX` (9 digits after +998).

**Tech Stack:** Node.js, Express, Mongoose, JWT (jsonwebtoken), bcryptjs, Joi (validation), swagger-jsdoc + swagger-ui-express, Jest + Supertest

---

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   └── swagger.js      # Swagger config
│   ├── models/
│   │   ├── User.js         # Single model: admin | barber | user
│   │   ├── Service.js      # Barber services
│   │   └── Booking.js      # Bookings
│   ├── middleware/
│   │   ├── auth.js         # JWT verify + role guard
│   │   └── validate.js     # Joi schema validation
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── barber.controller.js
│   │   ├── service.controller.js
│   │   └── booking.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── barber.routes.js
│   │   ├── service.routes.js
│   │   └── booking.routes.js
│   └── app.js
├── tests/
│   ├── auth.test.js
│   ├── barber.test.js
│   ├── service.test.js
│   └── booking.test.js
├── .env.example
├── .env
└── package.json
```

---

## Task 1: Project Init & Dependencies

**Files:**
- Create: `backend/package.json`
- Create: `backend/.env.example`
- Create: `backend/.env`
- Create: `backend/src/app.js`
- Create: `backend/src/config/db.js`

- [ ] **Step 1: Init project**

```bash
cd backend
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install express mongoose jsonwebtoken bcryptjs joi swagger-jsdoc swagger-ui-express cors dotenv
npm install --save-dev jest supertest nodemon
```

- [ ] **Step 3: Update package.json scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --testEnvironment node --forceExit"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 4: Create `.env.example`**

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/barbershop
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

- [ ] **Step 5: Create `.env`** (copy from example and fill values)

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/barbershop
JWT_SECRET=supersecretkey123
JWT_EXPIRES_IN=7d
```

- [ ] **Step 6: Create `src/config/db.js`**

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
```

- [ ] **Step 7: Create `src/app.js`**

```js
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
```

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat: init backend project structure"
```

---

## Task 2: Swagger Config

**Files:**
- Create: `backend/src/config/swagger.js`

- [ ] **Step 1: Create `src/config/swagger.js`**

```js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Barbershop API',
      version: '1.0.0',
      description: 'Barbershop booking system API',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
```

- [ ] **Step 2: Verify Swagger UI loads**

```bash
npm run dev
# Open: http://localhost:5000/api/docs
```

Expected: Swagger UI page loads (empty schemas for now).

- [ ] **Step 3: Commit**

```bash
git add backend/src/config/swagger.js
git commit -m "feat: add swagger config"
```

---

## Task 3: Models

**Files:**
- Create: `backend/src/models/User.js`
- Create: `backend/src/models/Service.js`
- Create: `backend/src/models/Booking.js`

- [ ] **Step 1: Create `src/models/User.js`**

```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PHONE_REGEX = /^\+998[0-9]{9}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [PHONE_REGEX, 'Phone must be +998XXXXXXXXX'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'barber', 'user'],
      default: 'user',
    },
    // barber only
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    bio: { type: String, default: '' },
    // user only
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

- [ ] **Step 2: Create `src/models/Service.js`**

```js
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    duration:    { type: Number, required: true, min: 1 }, // minutes
    barber:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
```

- [ ] **Step 3: Create `src/models/Booking.js`**

```js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    barber:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date:    { type: String, required: true }, // "2026-05-20"
    time:    { type: String, required: true }, // "10:00"
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    price: { type: Number, required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/models/
git commit -m "feat: add User, Service, Booking models"
```

---

## Task 4: Auth Middleware

**Files:**
- Create: `backend/src/middleware/auth.js`
- Create: `backend/src/middleware/validate.js`

- [ ] **Step 1: Create `src/middleware/auth.js`**

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { protect, authorize };
```

- [ ] **Step 2: Create `src/middleware/validate.js`**

```js
const Joi = require('joi');

const PHONE = Joi.string().pattern(/^\+998[0-9]{9}$/).required()
  .messages({ 'string.pattern.base': 'Phone must be +998XXXXXXXXX' });

const schemas = {
  register: Joi.object({
    firstName:   Joi.string().min(2).required(),
    lastName:    Joi.string().min(2).required(),
    phoneNumber: PHONE,
    password:    Joi.string().min(6).required(),
    role:        Joi.string().valid('admin', 'barber', 'user').default('user'),
  }),

  login: Joi.object({
    phoneNumber: PHONE,
    password:    Joi.string().required(),
  }),

  service: Joi.object({
    name:        Joi.string().min(2).required(),
    description: Joi.string().allow(''),
    price:       Joi.number().min(0).required(),
    duration:    Joi.number().min(1).required(),
  }),

  booking: Joi.object({
    barber:  Joi.string().hex().length(24).required(),
    service: Joi.string().hex().length(24).required(),
    date:    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    time:    Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    notes:   Joi.string().allow(''),
  }),
};

const validate = (schemaName) => (req, res, next) => {
  const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = validate;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/middleware/
git commit -m "feat: add auth and validation middleware"
```

---

## Task 5: Auth Controller & Routes

**Files:**
- Create: `backend/src/controllers/auth.controller.js`
- Create: `backend/src/routes/auth.routes.js`

- [ ] **Step 1: Create `src/controllers/auth.controller.js`**

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, role } = req.body;
    const exists = await User.findOne({ phoneNumber });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ firstName, lastName, phoneNumber, password, role });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, firstName, lastName, phoneNumber, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, phoneNumber, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
```

- [ ] **Step 2: Create `src/routes/auth.routes.js`**

```js
const router = require('express').Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, phoneNumber, password]
 *             properties:
 *               firstName:   { type: string, example: "Ali" }
 *               lastName:    { type: string, example: "Karimov" }
 *               phoneNumber: { type: string, example: "+998901234567" }
 *               password:    { type: string, example: "secret123" }
 *               role:        { type: string, enum: [admin, barber, user], example: "user" }
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation error or phone taken
 */
router.post('/register', validate('register'), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phoneNumber, password]
 *             properties:
 *               phoneNumber: { type: string, example: "+998901234567" }
 *               password:    { type: string, example: "secret123" }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate('login'), login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get('/me', protect, getMe);

module.exports = router;
```

- [ ] **Step 3: Write auth tests `tests/auth.test.js`**

```js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop_test');
});

afterAll(async () => {
  await User.deleteMany({ phoneNumber: /^\+99899/ });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('user');
  });

  it('rejects invalid phone', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '998901234567', password: 'secret123',
    });
    expect(res.status).toBe(400);
    expect(res.body.details[0]).toMatch(/\+998/);
  });

  it('rejects duplicate phone', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Ali', lastName: 'Karimov',
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'secret123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'wrongpass',
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns current user with valid token', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      phoneNumber: '+998991234567', password: 'secret123',
    });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.phoneNumber).toBe('+998991234567');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 4: Run tests**

```bash
cd backend && npm test -- tests/auth.test.js
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/auth.controller.js backend/src/routes/auth.routes.js backend/tests/auth.test.js
git commit -m "feat: add auth register/login/me endpoints with tests"
```

---

## Task 6: User & Barber Routes (Admin CRUD)

**Files:**
- Create: `backend/src/controllers/user.controller.js`
- Create: `backend/src/routes/user.routes.js`
- Create: `backend/src/controllers/barber.controller.js`
- Create: `backend/src/routes/barber.routes.js`

- [ ] **Step 1: Create `src/controllers/user.controller.js`**

```js
const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('bookings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Create `src/routes/user.routes.js`**

```js
const router = require('express').Router();
const { getAllUsers, getUserById, deleteUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (admin only)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', protect, authorize('admin'), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User object
 *       404:
 *         description: Not found
 */
router.get('/:id', protect, authorize('admin'), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
```

- [ ] **Step 3: Create `src/controllers/barber.controller.js`**

```js
const User = require('../models/User');

exports.getAllBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber' })
      .select('-password')
      .populate('services');
    res.json({ barbers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBarberById = async (req, res) => {
  try {
    const barber = await User.findOne({ _id: req.params.id, role: 'barber' })
      .select('-password')
      .populate('services');
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBarber = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, bio } = req.body;
    const barber = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phoneNumber, bio },
      { new: true, runValidators: true }
    ).select('-password');
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 4: Create `src/routes/barber.routes.js`**

```js
const router = require('express').Router();
const { getAllBarbers, getBarberById, updateBarber } = require('../controllers/barber.controller');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Barbers
 *   description: Barber management
 */

/**
 * @swagger
 * /api/barbers:
 *   get:
 *     summary: Get all barbers (public)
 *     tags: [Barbers]
 *     security: []
 *     responses:
 *       200:
 *         description: List of barbers with services
 */
router.get('/', getAllBarbers);

/**
 * @swagger
 * /api/barbers/{id}:
 *   get:
 *     summary: Get barber by ID (public)
 *     tags: [Barbers]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Barber object
 *       404:
 *         description: Not found
 */
router.get('/:id', getBarberById);

/**
 * @swagger
 * /api/barbers/{id}:
 *   put:
 *     summary: Update barber profile (admin or own barber)
 *     tags: [Barbers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Updated barber
 */
router.put('/:id', protect, authorize('admin', 'barber'), updateBarber);

module.exports = router;
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/user.controller.js backend/src/routes/user.routes.js backend/src/controllers/barber.controller.js backend/src/routes/barber.routes.js
git commit -m "feat: add user and barber routes"
```

---

## Task 7: Service Controller & Routes

**Files:**
- Create: `backend/src/controllers/service.controller.js`
- Create: `backend/src/routes/service.routes.js`

- [ ] **Step 1: Create `src/controllers/service.controller.js`**

```js
const Service = require('../models/Service');
const User = require('../models/User');

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate('barber', 'firstName lastName phoneNumber');
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('barber', 'firstName lastName');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const barberId = req.user.role === 'barber' ? req.user._id : req.body.barberId;
    const { name, description, price, duration } = req.body;
    const service = await Service.create({ name, description, price, duration, barber: barberId });
    await User.findByIdAndUpdate(barberId, { $push: { services: service._id } });
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await User.findByIdAndUpdate(service.barber, { $pull: { services: service._id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Create `src/routes/service.routes.js`**

```js
const router = require('express').Router();
const {
  getAllServices, getServiceById, createService, updateService, deleteService,
} = require('../controllers/service.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Barber services
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services (public)
 *     tags: [Services]
 *     security: []
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/', getAllServices);
router.get('/:id', getServiceById);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create service (barber or admin)
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, duration]
 *             properties:
 *               name:        { type: string, example: "Soch olish" }
 *               description: { type: string }
 *               price:       { type: number, example: 30000 }
 *               duration:    { type: number, example: 30 }
 *               barberId:    { type: string, description: "required if admin" }
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/', protect, authorize('barber', 'admin'), validate('service'), createService);
router.put('/:id', protect, authorize('barber', 'admin'), updateService);
router.delete('/:id', protect, authorize('barber', 'admin'), deleteService);

module.exports = router;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/service.controller.js backend/src/routes/service.routes.js
git commit -m "feat: add service CRUD endpoints"
```

---

## Task 8: Booking Controller & Routes

**Files:**
- Create: `backend/src/controllers/booking.controller.js`
- Create: `backend/src/routes/booking.routes.js`

- [ ] **Step 1: Create `src/controllers/booking.controller.js`**

```js
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { barber, service: serviceId, date, time, notes } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const booking = await Booking.create({
      user: req.user._id,
      barber,
      service: serviceId,
      date,
      time,
      notes,
      price: service.price,
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });
    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('barber', 'firstName lastName')
      .populate('service', 'name price duration');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'barber' ? { barber: req.user._id } : {};
    const bookings = await Booking.find(filter)
      .populate('user', 'firstName lastName phoneNumber')
      .populate('barber', 'firstName lastName')
      .populate('service', 'name price duration');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

- [ ] **Step 2: Create `src/routes/booking.routes.js`**

```js
const router = require('express').Router();
const {
  createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking,
} = require('../controllers/booking.controller');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Booking management
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create booking (user)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [barber, service, date, time]
 *             properties:
 *               barber:  { type: string, example: "64abc..." }
 *               service: { type: string, example: "64abc..." }
 *               date:    { type: string, example: "2026-05-20" }
 *               time:    { type: string, example: "10:00" }
 *               notes:   { type: string }
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', protect, authorize('user'), validate('booking'), createBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Get my bookings (user)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: User's bookings
 */
router.get('/my', protect, authorize('user'), getMyBookings);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (admin / barber sees own)
 *     tags: [Bookings]
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', protect, authorize('admin', 'barber'), getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (admin/barber)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, confirmed, cancelled, completed] }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/:id/status', protect, authorize('admin', 'barber'), updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel own booking (user)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.patch('/:id/cancel', protect, authorize('user'), cancelBooking);

module.exports = router;
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/booking.controller.js backend/src/routes/booking.routes.js
git commit -m "feat: add booking CRUD endpoints"
```

---

## Task 9: Final Verification

- [ ] **Step 1: Run all tests**

```bash
cd backend && npm test
```

Expected: All tests PASS.

- [ ] **Step 2: Start dev server and verify Swagger**

```bash
npm run dev
# Open: http://localhost:5000/api/docs
```

Expected: All 5 tag groups visible (Auth, Users, Barbers, Services, Bookings).

- [ ] **Step 3: Manual smoke test via Swagger**

1. `POST /api/auth/register` — register a user
2. `POST /api/auth/login` — get token
3. Click "Authorize" button → paste `Bearer <token>`
4. `GET /api/auth/me` — should return user

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete barbershop backend with JWT auth, models, swagger"
```

---

## API Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register |
| POST | /api/auth/login | Public | Login |
| GET  | /api/auth/me | Any | Current user |
| GET  | /api/users | Admin | All users |
| GET  | /api/users/:id | Admin | User by ID |
| DELETE | /api/users/:id | Admin | Delete user |
| GET  | /api/barbers | Public | All barbers |
| GET  | /api/barbers/:id | Public | Barber by ID |
| PUT  | /api/barbers/:id | Admin/Barber | Update barber |
| GET  | /api/services | Public | All services |
| GET  | /api/services/:id | Public | Service by ID |
| POST | /api/services | Barber/Admin | Create service |
| PUT  | /api/services/:id | Barber/Admin | Update service |
| DELETE | /api/services/:id | Barber/Admin | Delete service |
| POST | /api/bookings | User | Create booking |
| GET  | /api/bookings/my | User | My bookings |
| GET  | /api/bookings | Admin/Barber | All bookings |
| PATCH | /api/bookings/:id/status | Admin/Barber | Update status |
| PATCH | /api/bookings/:id/cancel | User | Cancel booking |
