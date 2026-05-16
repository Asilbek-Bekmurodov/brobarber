const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    barber: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    workStart:    { type: String, default: '09:00' },
    workEnd:      { type: String, default: '18:00' },
    lunchStart:   { type: String, default: '13:00' },
    lunchEnd:     { type: String, default: '14:00' },
    daysOff:      { type: [Number], default: [0, 6] },
    slotDuration: { type: Number, default: 30 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
