const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createChapter = async (courseId, chapterData) => {
  return await prisma.chapter.create({
    data: {
      ...chapterData,
      course_id: courseId,
    },
  });
};

const findChapterById = async (chapterId) => {
  return await prisma.chapter.findUnique({ where: { id: chapterId } });
};

const createMaterial = async (chapterId, materialData) => {
  return await prisma.material.create({
    data: {
      ...materialData,
      chapter_id: chapterId,
    },
  });
};

module.exports = { createChapter, findChapterById, createMaterial };