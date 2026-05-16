const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, role } = req.body;
    const safeRole = role === 'barber' ? 'barber' : 'user';

    const exists = await User.findOne({ phoneNumber });
    if (exists) return res.status(400).json({ message: 'Phone already registered' });

    const user = await User.create({ firstName, lastName, phoneNumber, password, role: safeRole });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, firstName, lastName, phoneNumber, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, phoneNumber, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};
