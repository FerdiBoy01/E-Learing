const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendSuccess } = require("../utils/responseHandler");

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, profession, bio, avatar_url, nim_nip } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        profession,
        bio,
        avatar_url,
        nim_nip,
      },
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
        // 🔥 INI KUNCINYA COY! Daftarin di sini biar kekirim ke Frontend
        level: true,
        points: true,
        balance: true,
      },
    });

    return sendSuccess(res, 200, "Profil berhasil diperbarui coy!", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Gagal update profil:", error);
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
        // 🔥 DAN DI SINI JUGA!
        level: true,
        points: true,
        balance: true,
        created_at: true,
      },
    });

    return sendSuccess(res, 200, "Data profil berhasil diambil", { user });
  } catch (error) {
    console.error("Gagal ambil profil:", error);
    next(error);
  }
};

module.exports = { updateProfile, getMyProfile };
