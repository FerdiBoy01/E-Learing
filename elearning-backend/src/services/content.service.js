const contentRepository = require('../repositories/content.repository');
const courseRepository = require('../repositories/course.repository'); // Import dari repo course sebelumnya
const AppError = require('../utils/AppError');

const addChapterToCourse = async (courseId, chapterData) => {
  // 1. Validasi apakah course-nya ada
  const course = await courseRepository.getCourseById(courseId);
  if (!course) {
    throw new AppError('Mata kuliah tidak ditemukan', 404);
  }

  // 2. Buat chapter
  return await contentRepository.createChapter(courseId, chapterData);
};

const addMaterialToChapter = async (chapterId, materialData) => {
  // 1. Validasi apakah chapter-nya ada
  const chapter = await contentRepository.findChapterById(chapterId);
  if (!chapter) {
    throw new AppError('Bab tidak ditemukan', 404);
  }

  // 2. Buat material
  return await contentRepository.createMaterial(chapterId, materialData);
};

module.exports = { addChapterToCourse, addMaterialToChapter };