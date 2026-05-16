const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

exports.createBooking = async (req, res) => {
  try {
    const { barber, service: serviceId, date, time, notes } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const conflict = await Booking.findOne({
      barber,
      date,
      time,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(409).json({ message: 'This time slot is already booked' });

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

function generateWeekSlots(schedule, weekStart) {
  const { workStart, workEnd, lunchStart, lunchEnd, daysOff, slotDuration } = schedule;
  const result = [];

  for (let day = 0; day < 7; day++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    if (daysOff.includes(dayOfWeek)) {
      result.push({ date: dateStr, slots: [] });
      continue;
    }

    const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const toStr = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

    const start = toMin(workStart);
    const end = toMin(workEnd);
    const ls = toMin(lunchStart);
    const le = toMin(lunchEnd);

    const slots = [];
    let cur = start;
    while (cur + slotDuration <= end) {
      if (cur >= ls && cur < le) { cur = le; continue; }
      slots.push(toStr(cur));
      cur += slotDuration;
    }
    result.push({ date: dateStr, slots });
  }
  return result;
}

exports.getAvailableSlots = async (req, res) => {
  try {
    const { barberId, weekStart } = req.query;
    if (!barberId || !weekStart) {
      return res.status(400).json({ message: 'barberId and weekStart required' });
    }

    const schedule = await Schedule.findOne({ barber: barberId });
    if (!schedule) return res.json({ slots: [] });

    const startDate = new Date(weekStart);
    const allSlots = generateWeekSlots(schedule, startDate);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    const endStr = endDate.toISOString().split('T')[0];

    const bookings = await Booking.find({
      barber: barberId,
      date: { $gte: weekStart, $lt: endStr },
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedSet = new Set(bookings.map((b) => `${b.date}|${b.time}`));

    const result = allSlots.map((day) => ({
      date: day.date,
      slots: day.slots.map((time) => ({
        time,
        available: !bookedSet.has(`${day.date}|${time}`),
      })),
    }));

    res.json({ slots: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
