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
