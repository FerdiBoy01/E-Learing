const courseService = require("../services/course.service");
const { sendSuccess } = require("../utils/responseHandler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createNewCourse(req.body, req.user);
    return sendSuccess(res, 201, "Mata kuliah berhasil dibuat (Draft)", {
      course,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourseCatalog(req.user);
    return sendSuccess(res, 200, "Daftar mata kuliah berhasil diambil", {
      courses,
    });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseDetail(req.params.id);
    return sendSuccess(res, 200, "Detail mata kuliah berhasil diambil", {
      course,
    });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      is_published,
      visibility,
      price,
      type,
      reward_points,
      reward_exp,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (price !== undefined) updateData.price = parseInt(price);
    if (type !== undefined) updateData.type = type;

    if (reward_points !== undefined)
      updateData.reward_points = parseInt(reward_points);
    if (reward_exp !== undefined) updateData.reward_exp = parseInt(reward_exp);

    const course = await courseService.updateExistingCourse(
      req.params.id,
      updateData,
      req.user,
    );
    return sendSuccess(res, 200, "Mata kuliah berhasil diperbarui", { course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteExistingCourse(req.params.id, req.user);
    return sendSuccess(res, 200, "Mata kuliah berhasil dihapus", null);
  } catch (error) {
    next(error);
  }
};

const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: studentId, course_id: courseId },
      },
    });

    return sendSuccess(res, 200, "Status Enrollment", {
      enrolled: !!enrollment,
      is_completed: enrollment?.is_completed || false,
      completed_at: enrollment?.completed_at || null,
    });
  } catch (error) {
    next(error);
  }
};

const claimReward = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        student_id_course_id: { student_id: studentId, course_id: courseId },
      },
      include: { course: true },
    });

    if (!enrollment)
      return res
        .status(400)
        .json({ success: false, message: "Lu belum ambil kelas ini coy!" });
    if (enrollment.is_completed)
      return res
        .status(400)
        .json({ success: false, message: "Reward udah pernah diklaim!" });

    const student = await prisma.user.findUnique({ where: { id: studentId } });

    const expGained = enrollment.course.reward_exp || 500;
    const pointsGained = enrollment.course.reward_points || 0;

    const totalExp = student.exp + expGained;
    const newLevel = Math.floor(totalExp / 1000) + 1;
    const isLevelUp = newLevel > student.level;

    await prisma.$transaction([
      prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { is_completed: true, completed_at: new Date() },
      }),
      prisma.user.update({
        where: { id: studentId },
        data: {
          exp: totalExp,
          level: newLevel,
          points: { increment: pointsGained },
        },
      }),
    ]);

    return sendSuccess(res, 200, "Berhasil klaim sertifikat dan Reward!", {
      expGained,
      pointsGained,
      newLevel,
      isLevelUp,
    });
  } catch (error) {
    next(error);
  }
};

const getMyUnlockedMaterials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const unlockedList = await prisma.materialUnlock.findMany({
      where: { user_id: userId },
      select: { material_id: true },
    });
    const unlockedIds = unlockedList.map((item) => item.material_id);
    return sendSuccess(
      res,
      200,
      "Berhasil mengambil daftar materi eceran",
      unlockedIds,
    );
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 🔥 FITUR BARU 1: Ambil Daftar Kelas Milik Pengajar (Lecturer/Creator)
// =========================================================================
const getLecturerCourses = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;

    // Pakai query raw biar kebal bypass skema prisma local lu yang nyangkut cache
    const courses = await prisma.$queryRawUnsafe(
      `SELECT id, title, description, thumbnail_url, status, is_published, visibility, type, price, takedown_reason, created_at 
       FROM courses 
       WHERE lecturer_id = $1 
       ORDER BY created_at DESC`,
      lecturerId,
    );

    return sendSuccess(
      res,
      200,
      "Daftar kurikulum internal pengajar berhasil diambil",
      courses,
    );
  } catch (error) {
    console.error("Gagal get lecturer courses:", error);
    next(error);
  }
};

// =========================================================================
// 🔥 FITUR BARU 2: Ambil Semua Notifikasi Milik User (Lonceng Notif)
// =========================================================================
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Pakai query raw untuk menerobos tabel notifications buatan force-migrate tadi
    const notifications = await prisma.$queryRawUnsafe(
      `SELECT id, title, message, is_read, created_at 
       FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      userId,
    );

    return sendSuccess(
      res,
      200,
      "Daftar notifikasi berhasil diambil",
      notifications,
    );
  } catch (error) {
    console.error("Gagal get notifications:", error);
    next(error);
  }
};

const readNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Eksekusi SQL murni biar aman dari drama cache skema prisma local lu
    await prisma.$executeRawUnsafe(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1`,
      id,
    );

    return sendSuccess(res, 200, "Notifikasi berhasil ditandai telah dibaca!");
  } catch (error) {
    console.error("Gagal membaca notifikasi:", error);
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  checkEnrollmentStatus,
  claimReward,
  getMyUnlockedMaterials,
  getLecturerCourses, // 🔥 Daftarkan export baru
  getMyNotifications, // 🔥 Daftarkan export baru
  readNotification,
};
