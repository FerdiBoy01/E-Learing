const courseService = require('../services/course.service');
const { sendSuccess } = require('../utils/responseHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCourse = async (req, res, next) => {
  try {
    const course = await courseService.createCourse(req.body, req.user.id);
    return sendSuccess(res, 201, 'Mata kuliah berhasil dibuat', { course });
  } catch (error) {
    next(error);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const whereCondition = userRole === 'STUDENT' ? { status: 'ACTIVE' } : {};

    const courses = await prisma.course.findMany({
      where: whereCondition,
      include: {
        lecturer: { select: { name: true } },
        _count: {
          select: { 
            chapters: true,
            enrollments: true 
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return sendSuccess(res, 200, 'Daftar mata kuliah berhasil diambil', { courses });
  } catch (error) {
    console.error("Gagal ambil data katalog:", error);
    next(error);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const course = await prisma.course.findUnique({
      where: { id: id },
      include: {
        lecturer: { 
          select: { name: true, profession: true, bio: true, avatar_url: true } 
        },
        _count: {
          select: { enrollments: true }
        },
        chapters: {
          orderBy: { order_index: 'asc' },
          include: {
            materials: {
              orderBy: { order_index: 'asc' },
              select: { id: true, title: true, type: true }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Kelas tidak ditemukan' });
    }

    return sendSuccess(res, 200, 'Detail mata kuliah berhasil diambil', { course });
  } catch (error) {
    console.error("Gagal ambil detail course:", error);
    next(error);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const course = await prisma.course.update({
      where: { id: id },
      data: updateData
    });

    return sendSuccess(res, 200, 'Mata kuliah berhasil diperbarui', { course });
  } catch (error) {
    console.error("Gagal Update Course:", error);
    next(error);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id: id } });
    return sendSuccess(res, 200, 'Mata kuliah berhasil dihapus', null);
  } catch (error) {
    console.error("Gagal Hapus Course:", error);
    next(error);
  }
};

// ==========================================
// FUNGSI CEK STATUS ENROLLMENT
// ==========================================
const checkEnrollmentStatus = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { 
        student_id_course_id: { student_id: studentId, course_id: courseId } 
      }
    });

    return sendSuccess(res, 200, 'Status', { 
      enrolled: !!enrollment,
      is_completed: enrollment?.is_completed || false,
      completed_at: enrollment?.completed_at || null
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FUNGSI KOMITMEN AMBIL KELAS (ENROLL)
// ==========================================
const enrollCourse = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const alreadyEnrolled = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } }
    });
    if (alreadyEnrolled) {
      return sendSuccess(res, 200, 'Sudah enroll', { enrolled: true });
    }

    const activeCourse = await prisma.enrollment.findFirst({
      where: { student_id: studentId, is_completed: false },
      include: { course: { select: { title: true } } }
    });

    if (activeCourse) {
      return res.status(403).json({ 
        success: false, 
        message: `Selesaikan dulu kelas "${activeCourse.course.title}" sebelum ngambil kelas baru coy!` 
      });
    }

    await prisma.enrollment.create({
      data: { student_id: studentId, course_id: courseId }
    });

    return sendSuccess(res, 201, 'Komitmen sah! Selamat belajar.', { enrolled: true });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FUNGSI KLAIM EXP & SERTIFIKAT
// ==========================================
const claimReward = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.user.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: { student_id_course_id: { student_id: studentId, course_id: courseId } }
    });

    if (!enrollment) return res.status(400).json({success: false, message: "Lu belum ambil kelas ini coy!"});
    if (enrollment.is_completed) return res.status(400).json({success: false, message: "Reward udah pernah diklaim!"});

    const expGained = 500; 

    // Pakai Transaction biar kalau satu gagal, batal semua
    await prisma.$transaction([
      prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { is_completed: true, completed_at: new Date() }
      }),
      prisma.user.update({
        where: { id: studentId },
        data: { exp: { increment: expGained } }
      })
    ]);

    return sendSuccess(res, 200, 'Berhasil klaim sertifikat dan EXP!', { expGained });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse,
  checkEnrollmentStatus, enrollCourse, claimReward
};