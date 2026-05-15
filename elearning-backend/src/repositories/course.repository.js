const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCourse = async (courseData) => {
  return await prisma.course.create({ data: courseData });
};

const getAllCourses = async () => {
  // Mengambil daftar course beserta data nama dosen pengajarnya
  return await prisma.course.findMany({
    include: {
      lecturer: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { chapters: true }, // Menghitung jumlah bab
      },
    },
  });
};

const getCourseById = async (id) => {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      lecturer: {
        select: { id: true, name: true, email: true },
      },
      chapters: {
        orderBy: { order_index: 'asc' }, // Urutkan bab berdasarkan urutan
        include: {
          materials: {
            orderBy: { order_index: 'asc' },
            select: { id: true, title: true, type: true }, // Jangan ambil 'content' dulu agar response tidak terlalu berat
          },
        },
      },
    },
  });
};

module.exports = { createCourse, getAllCourses, getCourseById };