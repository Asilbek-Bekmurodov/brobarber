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
