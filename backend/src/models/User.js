const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PHONE_REGEX = /^\+998[0-9]{9}$/;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [PHONE_REGEX, 'Phone must be +998XXXXXXXXX'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ['admin', 'barber', 'user'],
      default: 'user',
    },
    // barber only
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    bio: { type: String, default: '' },
    // user only
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
