const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCourse = async (courseData) => {
  return await prisma.course.create({ data: courseData });
};

const findCourses = async (whereCondition) => {
  return await prisma.course.findMany({
    where: whereCondition,
    include: {
      lecturer: { select: { name: true, avatar_url: true } },
      _count: { select: { chapters: true, enrollments: true } },
    },
    orderBy: { created_at: 'desc' },
  });
};

const findCourseById = async (id) => {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      lecturer: { select: { name: true, profession: true, bio: true, avatar_url: true } },
      _count: { select: { enrollments: true } },
      chapters: {
        orderBy: { order_index: 'asc' },
        include: {
          materials: {
            orderBy: { order_index: 'asc' },
            select: { id: true, title: true, type: true, is_free_preview: true },
          },
        },
      },
    },
  });
};

const updateCourse = async (id, updateData) => {
  return await prisma.course.update({
    where: { id },
    data: updateData,
  });
};

const deleteCourse = async (id) => {
  return await prisma.course.delete({ where: { id } });
};

module.exports = { 
  createCourse, findCourses, findCourseById, updateCourse, deleteCourse 
};