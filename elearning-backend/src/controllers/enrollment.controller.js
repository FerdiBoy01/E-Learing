const enrollmentService = require('../services/enrollment.service');
const { sendSuccess } = require('../utils/responseHandler');

const enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { accessCode } = req.body; 
    const studentId = req.user.id; // Didapat dari authMiddleware lu (protect)

    // Panggil Service
    const enrollment = await enrollmentService.enrollStudent(studentId, courseId, accessCode);

    // Kirim Response
    return sendSuccess(res, 201, `Berhasil bergabung dengan kelas ${enrollment.course.title}!`, { enrollment });

  } catch (error) {
    // Akan otomatis ditangkap oleh global error handler lu
    next(error);
  }
};

module.exports = {
  enrollCourse,
};