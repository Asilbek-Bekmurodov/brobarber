const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Barbershop API',
      version: '1.0.0',
      description: 'Barbershop booking system API',
    },
    servers: [
      { url: 'https://brobarber-392z.onrender.com', description: 'Production' },
      { url: 'http://localhost:5002', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
