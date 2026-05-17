const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};

const createUser = async (userData) => {
  return await prisma.user.create({ data: userData });
};

// 🔥 KITA PAKSA BACKEND BUAT BAWA SEMUA DATA GAMIFIKASI KE FRONTEND
const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nim_nip: true,
      avatar_url: true,
      profession: true,
      bio: true,
      exp: true,
      level: true,
      points: true, // 🌟 INI DIA BINTANG UTAMANYA BIAR GAK KETINGGALAN!
      balance: true,
      created_at: true,
      updated_at: true,
    },
  });
};

module.exports = { findUserByEmail, createUser, findUserById };
