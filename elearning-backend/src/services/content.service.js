const contentRepository = require('../repositories/content.repository');
const courseRepository = require('../repositories/course.repository');
const AppError = require('../utils/AppError');

const addChapterToCourse = async (courseId, data) => {
  // 🔥 Manggil fungsi baru dari course.repository.js
  const course = await courseRepository.findCourseById(courseId);
  if (!course) throw new AppError('Kelas tidak ditemukan', 404);

  return await contentRepository.createChapter(courseId, data);
};

const editChapter = async (chapterId, data) => {
  const chapter = await contentRepository.findChapterById(chapterId);
  if (!chapter) throw new AppError('Bab tidak ditemukan', 404);
  return await contentRepository.updateChapter(chapterId, data);
};

const removeChapter = async (chapterId) => {
  const chapter = await contentRepository.findChapterById(chapterId);
  if (!chapter) throw new AppError('Bab tidak ditemukan', 404);
  await contentRepository.deleteChapter(chapterId);
};

const addMaterialToChapter = async (chapterId, data) => {
  const chapter = await contentRepository.findChapterById(chapterId);
  if (!chapter) throw new AppError('Bab tidak ditemukan', 404);
  return await contentRepository.createMaterial(chapterId, data);
};

const getMaterialDetail = async (materialId) => {
  const material = await contentRepository.findMaterialById(materialId);
  if (!material) throw new AppError('Materi tidak ditemukan', 404);
  return material;
};

const editMaterial = async (materialId, data) => {
  const material = await contentRepository.findMaterialById(materialId);
  if (!material) throw new AppError('Materi tidak ditemukan', 404);
  return await contentRepository.updateMaterial(materialId, data);
};

const removeMaterial = async (materialId) => {
  const material = await contentRepository.findMaterialById(materialId);
  if (!material) throw new AppError('Materi tidak ditemukan', 404);
  await contentRepository.deleteMaterial(materialId);
};

module.exports = { 
  addChapterToCourse, editChapter, removeChapter, 
  addMaterialToChapter, getMaterialDetail, editMaterial, removeMaterial 
};