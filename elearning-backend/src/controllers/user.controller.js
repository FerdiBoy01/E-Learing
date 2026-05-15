const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendSuccess } = require('../utils/responseHandler');

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    // 🔥 Kita tambahkan nim_nip biar sinkron sama frontend mahasiswa
    const { name, profession, bio, avatar_url, nim_nip } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        name, 
        profession, 
        bio, 
        avatar_url,
        nim_nip // 🔥 Masukin ini juga coy
      },
      select: { // Kita batasi data yang dikirim balik ke frontend
        id: true,
        name: true,
        email: true,
        role: true,
        nim_nip: true,
        avatar_url: true,
        profession: true,
        bio: true,
        exp: true
      }
    });

    return sendSuccess(res, 200, 'Profil berhasil diperbarui coy!', { user: updatedUser });
  } catch (error) {
    console.error("Gagal update profil:", error);
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      select: { // Jangan kirim password_hash ke frontend!
        id: true,
        name: true,
        email: true,
        role: true,
        nim_nip: true,
        avatar_url: true,
        profession: true,
        bio: true,
        exp: true,
        created_at: true
      }
    });
    
    return sendSuccess(res, 200, 'Data profil berhasil diambil', { user });
  } catch (error) {
    console.error("Gagal ambil profil:", error);
    next(error);
  }
};

module.exports = { updateProfile, getMyProfile };