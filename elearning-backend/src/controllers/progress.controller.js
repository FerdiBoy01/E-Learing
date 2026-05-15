const progressService = require('../services/progress.service');
const { sendSuccess } = require('../utils/responseHandler');

const completeMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user.id; // Didapat dari token mahasiswa yang login

    const progress = await progressService.completeMaterial(studentId, materialId);
    
    return sendSuccess(res, 200, 'Materi berhasil ditandai selesai', { progress });
  } catch (error) {
    next(error);
  }
};

const getMyProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const progress = await progressService.getMyProgress(studentId);
    
    return sendSuccess(res, 200, 'Data progress belajar berhasil diambil', { progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { completeMaterial, getMyProgress };