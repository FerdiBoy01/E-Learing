const contentService = require('../services/content.service');
const { sendSuccess } = require('../utils/responseHandler');

const createChapter = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const chapter = await contentService.addChapterToCourse(courseId, req.body);
    return sendSuccess(res, 201, 'Bab berhasil ditambahkan', { chapter });
  } catch (error) { next(error); }
};

const updateChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const updatedChapter = await contentService.editChapter(chapterId, req.body);
    return sendSuccess(res, 200, 'Bab berhasil diperbarui', updatedChapter);
  } catch (error) { next(error); }
};

const deleteChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    await contentService.removeChapter(chapterId);
    return sendSuccess(res, 200, 'Bab berhasil dihapus permanen', null);
  } catch (error) { next(error); }
};

const createMaterial = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const material = await contentService.addMaterialToChapter(chapterId, req.body);
    return sendSuccess(res, 201, 'Materi berhasil ditambahkan', { material });
  } catch (error) { next(error); }
};

const getMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const material = await contentService.getMaterialDetail(materialId);
    return sendSuccess(res, 200, 'Detail materi berhasil diambil', { material });
  } catch (error) { next(error); }
};

const updateMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const updatedMaterial = await contentService.editMaterial(materialId, req.body);
    return sendSuccess(res, 200, 'Materi berhasil diperbarui', updatedMaterial);
  } catch (error) { next(error); }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    await contentService.removeMaterial(materialId);
    return sendSuccess(res, 200, 'Materi berhasil dihapus permanen', null);
  } catch (error) { next(error); }
};

module.exports = { 
  createChapter, updateChapter, deleteChapter, 
  createMaterial, getMaterial, updateMaterial, deleteMaterial 
};