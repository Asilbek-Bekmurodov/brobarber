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
