const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    // Mengambil pesan error pertama dari Zod
    const errorMessage = err.errors.map((e) => e.message).join(', ');
    next(new AppError(errorMessage, 400));
  }
};

module.exports = validate;