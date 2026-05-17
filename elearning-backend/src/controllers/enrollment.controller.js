const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const enrollmentService = require("../services/enrollment.service");
const { sendSuccess } = require("../utils/responseHandler");

const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { accessCode } = req.body;
    const studentId = req.user.id; // Didapat dari authMiddleware lu (protect)

    // Panggil Service
    const enrollment = await enrollmentService.enrollStudent(
      studentId,
      courseId,
      accessCode,
    );

    // Kirim Response
    return sendSuccess(
      res,
      201,
      `Berhasil bergabung dengan kelas ${enrollment.course.title}!`,
      { enrollment },
    );
  } catch (error) {
    // Akan otomatis ditangkap oleh global error handler lu
    next(error);
  }
};

// 🔥 FUNGSI BARU: Ambil semua kelas milik siswa yang lagi login
const getMyEnrollments = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Tembak langsung ke DB biar cepet & nggak usah ubah file Service/Repo
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: studentId, // Pastikan nama kolom di database lu 'student_id'
      },
      select: {
        course_id: true, // Kita cuma butuh ID Kelasnya aja buat di Frontend
      },
    });

    return sendSuccess(
      res,
      200,
      "Berhasil mengambil data kelas milik saya",
      enrollments,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollCourse,
  getMyEnrollments, // Wajib diexport ke router!
};
