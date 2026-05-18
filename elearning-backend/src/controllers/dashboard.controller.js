const dashboardService = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/responseHandler");

const getLecturerDashboard = async (req, res, next) => {
  try {
    const lecturerId = req.user.id;
    const stats = await dashboardService.getLecturerDashboard(lecturerId);

    return sendSuccess(
      res,
      200,
      "Statistik Dashboard Dosen berhasil diambil",
      stats,
    );
  } catch (error) {
    next(error);
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const stats = await dashboardService.getStudentDashboard(studentId);

    return sendSuccess(
      res,
      200,
      "Statistik Dashboard Mahasiswa berhasil diambil",
      stats,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { getLecturerDashboard, getStudentDashboard };
