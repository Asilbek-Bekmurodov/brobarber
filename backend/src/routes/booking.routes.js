const router = require('express').Router();
const {
  createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking, getAvailableSlots,
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
router.get('/slots', getAvailableSlots);

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
