const dashboardRepository = require('../repositories/dashboard.repository');

const getLecturerDashboard = async (lecturerId) => {
  return await dashboardRepository.getLecturerStats(lecturerId);
};

const getStudentDashboard = async (studentId) => {
  return await dashboardRepository.getStudentStats(studentId);
};

module.exports = { getLecturerDashboard, getStudentDashboard };