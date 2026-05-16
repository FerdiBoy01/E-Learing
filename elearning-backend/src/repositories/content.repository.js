const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createChapter = async (courseId, data) => {
  return await prisma.chapter.create({
    data: {
      course_id: courseId,
      title: data.title,
      order_index: data.order_index ? parseInt(data.order_index) : 1,
    }
  });
};

const findChapterById = async (id) => {
  return await prisma.chapter.findUnique({ where: { id } });
};

const updateChapter = async (id, data) => {
  return await prisma.chapter.update({ 
    where: { id }, 
    data: {
      title: data.title !== undefined ? data.title : undefined,
      order_index: data.order_index !== undefined ? parseInt(data.order_index) : undefined
    } 
  });
};

const deleteChapter = async (id) => {
  return await prisma.chapter.delete({ where: { id } });
};

const createMaterial = async (chapterId, data) => {
  return await prisma.material.create({
    data: {
      chapter_id: chapterId,
      title: data.title,
      type: data.type || 'LESSON',
      content: data.content || '',
      order_index: data.order_index ? parseInt(data.order_index) : 1,
    }
  });
};

const findMaterialById = async (id) => {
  return await prisma.material.findUnique({ where: { id } });
};

const updateMaterial = async (id, data) => {
  return await prisma.material.update({ 
    where: { id }, 
    data: {
      title: data.title !== undefined ? data.title : undefined,
      type: data.type !== undefined ? data.type : undefined,
      content: data.content !== undefined ? data.content : undefined,
      order_index: data.order_index !== undefined ? parseInt(data.order_index) : undefined
    }
  });
};

const deleteMaterial = async (id) => {
  return await prisma.material.delete({ where: { id } });
};

module.exports = {
  createChapter, findChapterById, updateChapter, deleteChapter,
  createMaterial, findMaterialById, updateMaterial, deleteMaterial
};