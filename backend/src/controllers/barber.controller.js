const User = require('../models/User');

exports.getAllBarbers = async (req, res) => {
  try {
    const barbers = await User.find({ role: 'barber' })
      .select('-password')
      .populate('services');
    res.json({ barbers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBarberById = async (req, res) => {
  try {
    const barber = await User.findOne({ _id: req.params.id, role: 'barber' })
      .select('-password')
      .populate('services');
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBarber = async (req, res) => {
  try {
    // barber can only update own profile; admin can update any
    if (req.user.role === 'barber' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { firstName, lastName, phoneNumber, bio } = req.body;
    const barber = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, phoneNumber, bio },
      { new: true, runValidators: true }
    ).select('-password');
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json({ barber });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
