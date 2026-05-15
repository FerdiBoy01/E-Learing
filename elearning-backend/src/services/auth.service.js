const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const register = async (data) => {
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('Email sudah terdaftar', 400);
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  // 3. Simpan user ke database
  const newUser = await userRepository.createUser({
    ...data,
    password_hash: hashedPassword,
  });

  // 4. Generate token
  const token = generateToken(newUser.id);

  // Hapus password dari response untuk keamanan
  newUser.password_hash = undefined;

  return { user: newUser, token };
};

const login = async (email, password) => {
  // 1. Cek apakah user ada
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  // 2. Cek apakah password cocok
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError('Email atau password salah', 401);
  }

  // 3. Generate token
  const token = generateToken(user.id);
  
  user.password_hash = undefined;
  
  return { user, token };
};

module.exports = { register, login };