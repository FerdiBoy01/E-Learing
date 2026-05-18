const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const register = async (data) => {
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const { password, ...validData } = data;

  const newUser = await userRepository.createUser({
    ...validData,
    password_hash: hashedPassword,
  });

  const token = generateToken(newUser.id, newUser.role);
  newUser.password_hash = undefined;

  return { user: newUser, token };
};

const login = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Email atau password salah", 401);
  }

  // 🔥 SECURITY LAYER 1: Blokir mutlak jika status akun BANNED!
  if (user.role === "BANNED") {
    throw new AppError(
      "Akses Ditolak! Akun Anda telah dibekukan secara permanen oleh Administrator.",
      403,
    );
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError("Email atau password salah", 401);
  }

  const token = generateToken(user.id, user.role);
  user.password_hash = undefined;

  return { user, token };
};

module.exports = { register, login };
