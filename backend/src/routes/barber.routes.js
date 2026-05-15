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
