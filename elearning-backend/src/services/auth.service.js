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
  // 1. Cek apakah email sudah terdaftar
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email sudah terdaftar", 400);
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  // 🔥 3. FIX: Buang 'password' mentah dari object data biar Prisma nggak ngamuk
  const { password, ...validData } = data;

  // 4. Simpan user ke database
  const newUser = await userRepository.createUser({
    ...validData, // Sekarang cuma berisi name, email, role, nim_nip
    password_hash: hashedPassword,
  });

  // 5. Generate token dengan bawa ID dan Role
  const token = generateToken(newUser.id, newUser.role);

  // Hapus password dari response untuk keamanan
  newUser.password_hash = undefined;

  return { user: newUser, token };
};

const login = async (email, password) => {
  // ... (KODE LOGIN LU TETAP SAMA KAYAK SEBELUMNYA)
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Email atau password salah", 401);
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
