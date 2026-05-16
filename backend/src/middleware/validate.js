const Joi = require('joi');

const PHONE = Joi.string().pattern(/^\+998[0-9]{9}$/).required()
  .messages({ 'string.pattern.base': 'Phone must be +998XXXXXXXXX' });

const schemas = {
  register: Joi.object({
    firstName:   Joi.string().min(2).required(),
    lastName:    Joi.string().min(2).required(),
    phoneNumber: PHONE,
    password:    Joi.string().min(6).required(),
    role:        Joi.string().valid('user', 'barber').optional(),
  }),

  login: Joi.object({
    phoneNumber: PHONE,
    password:    Joi.string().required(),
  }),

  service: Joi.object({
    name:        Joi.string().min(2).required(),
    description: Joi.string().allow(''),
    price:       Joi.number().min(0).required(),
    duration:    Joi.number().min(1).required(),
  }),

  booking: Joi.object({
    barber:  Joi.string().hex().length(24).required(),
    service: Joi.string().hex().length(24).required(),
    date:    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
    time:    Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
    notes:   Joi.string().allow(''),
  }),
};

const validate = (schemaName) => (req, res, next) => {
  const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = validate;
