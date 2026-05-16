const Schedule = require('../models/Schedule');

exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ barber: req.params.barberId });
    if (!schedule) return res.json({ schedule: null });
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upsertSchedule = async (req, res) => {
  try {
    const { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration } = req.body;
    const schedule = await Schedule.findOneAndUpdate(
      { barber: req.user._id },
      { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ schedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
