const router = require('express').Router();
const { getSchedule, upsertSchedule } = require('../controllers/schedule.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/:barberId', getSchedule);
router.put('/', protect, authorize('barber', 'admin'), upsertSchedule);

module.exports = router;
