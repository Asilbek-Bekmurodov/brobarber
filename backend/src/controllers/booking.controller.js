const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

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
