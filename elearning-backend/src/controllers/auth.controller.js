const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/responseHandler");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, 201, "Registrasi berhasil", result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, 200, "Login berhasil", result);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    user.password_hash = undefined;
    return sendSuccess(res, 200, "Data profil berhasil diambil", { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
