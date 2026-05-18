const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { sendSuccess } = require("../utils/responseHandler");

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, profession, bio, avatar_url, nim_nip } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, profession, bio, avatar_url, nim_nip },
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

const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;

    const updateData = {};

    // 🔥 FIX: Masukin "BANNED" ke dalam daftar array biar gak ditolak controller!
    if (role) {
      const validRoles = ["STUDENT", "LECTURER", "CREATOR", "ADMIN", "BANNED"];
      if (!validRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Role tidak valid!" });
      }
      updateData.role = role;
    }

    if (is_active !== undefined) {
      updateData.is_active = is_active;
    }

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: updateData,
    });

    return sendSuccess(
      res,
      200,
      "Data pengguna berhasil diperbarui dengan aman!",
      {
        user: updatedUser,
      },
    );
  } catch (error) {
    console.error("Gagal mutasi data user:", error);
    next(error);
  }
};

// 🔥 FITUR BARU: Pemusnahan Data Permanen
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prisma otomatis akan menghapus data berelasi (seperti kelas/transaksi) jika di schema pakai onDelete: Cascade
    await prisma.user.delete({
      where: { id: id },
    });

    return sendSuccess(
      res,
      200,
      "Entitas akun berhasil dimusnahkan secara permanen!",
    );
  } catch (error) {
    console.error("Gagal menghapus data user:", error);
    next(error);
  }
};

// Jangan lupa daftarin deleteUser di sini
module.exports = { updateProfile, getMyProfile, updateUserRole, deleteUser };
