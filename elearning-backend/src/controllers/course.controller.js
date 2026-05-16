const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/responseHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // Hanya dipake buat claimReward/checkEnrollment sisaan

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createNewCourse(req.body, req.user);
    return sendSuccess(res, 201, 'Mata kuliah berhasil dibuat (Draft)', { course });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getCourseCatalog(req.user);
    return sendSuccess(res, 200, 'Daftar mata kuliah berhasil diambil', { courses });
  } catch (error) {
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourseDetail(req.params.id);
    return sendSuccess(res, 200, 'Detail mata kuliah berhasil diambil', { course });
  } catch (error) {
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    // 🔥 Tambahin tangkapan buat reward_points dan reward_exp
    const { title, description, is_published, visibility, price, type, reward_points, reward_exp } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (is_published !== undefined) updateData.is_published = is_published;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (price !== undefined) updateData.price = parseInt(price);
    if (type !== undefined) updateData.type = type;
    
    // 🔥 Masukin ke updateData biar tersimpan di database
    if (reward_points !== undefined) updateData.reward_points = parseInt(reward_points);
    if (reward_exp !== undefined) updateData.reward_exp = parseInt(reward_exp);

    const course = await courseService.updateExistingCourse(req.params.id, updateData, req.user);
    return sendSuccess(res, 200, 'Mata kuliah berhasil diperbarui', { course });
  } catch (error) {
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    await courseService.deleteExistingCourse(req.params.id, req.user);
    return sendSuccess(res, 200, 'Mata kuliah berhasil dihapus', null);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CEK STATUS & KLAIM EXP (GAMIFICATION ENGINE)
// ==========================================
const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } }
    });

    return sendSuccess(res, 200, 'Status Enrollment', { 
      enrolled: !!enrollment,
      is_completed: enrollment?.is_completed || false,
      completed_at: enrollment?.completed_at || null
    });
  } catch (error) {
    next(error);
  }
};

const claimReward = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    // Ambil data enrollment beserta data course-nya (biar dapet nominal reward_exp & points)
    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } },
      include: { course: true }
    });

    if (!enrollment) return res.status(400).json({success: false, message: "Lu belum ambil kelas ini coy!"});
    if (enrollment.is_completed) return res.status(400).json({success: false, message: "Reward udah pernah diklaim!"});

    const student = await prisma.user.findUnique({ where: { id: studentId } });

    // Tarik hadiah dari pengaturan kelas (Kalau kosong, defaultnya 500 EXP, 0 Points)
    const expGained = enrollment.course.reward_exp || 500; 
    const pointsGained = enrollment.course.reward_points || 0;

    // 🔥 LOGIKA LEVELING RPG (Tiap 1000 EXP Naik Level)
    const totalExp = student.exp + expGained;
    const newLevel = Math.floor(totalExp / 1000) + 1; // Rumus: 0-999 = Lvl 1 | 1000-1999 = Lvl 2 | dst...
    const isLevelUp = newLevel > student.level;

    await prisma.$transaction([
      // 1. Tandai kelas lulus
      prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { is_completed: true, completed_at: new Date() }
      }),
      // 2. Suntik EXP, Poin, dan update Level mahasiswa
      prisma.user.update({
        where: { id: studentId },
        data: { 
          exp: totalExp,
          level: newLevel,
          points: { increment: pointsGained }
        }
      })
    ]);

    return sendSuccess(res, 200, 'Berhasil klaim sertifikat dan Reward!', { 
      expGained, 
      pointsGained,
      newLevel,
      isLevelUp
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse,
  checkEnrollmentStatus, claimReward 
};