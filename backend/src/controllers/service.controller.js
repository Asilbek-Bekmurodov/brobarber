const Service = require('../models/Service');
const User = require('../models/User');

exports.getAllServices = async (req, res) => {
  try {
    const filter = req.query.barberId ? { barber: req.query.barberId } : {};
    const services = await Service.find(filter).populate('barber', 'firstName lastName phoneNumber');
    res.json({ services });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('barber', 'firstName lastName');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const barberId = req.user.role === 'barber' ? req.user._id : req.body.barberId;
    const { name, description, price, duration } = req.body;
    const service = await Service.create({ name, description, price, duration, barber: barberId });
    await User.findByIdAndUpdate(barberId, { $push: { services: service._id } });
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (req.user.role === 'barber' && String(service.barber) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { name, description, price, duration } = req.body;
    Object.assign(service, { name, description, price, duration });
    await service.save();
    res.json({ service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (req.user.role === 'barber' && String(service.barber) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await service.deleteOne();
    await User.findByIdAndUpdate(service.barber, { $pull: { services: service._id } });
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
