const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Cari kursus berdasarkan ID
const findCourseById = async (courseId) => {
  return await prisma.course.findUnique({
    where: { id: courseId },
  });
};

// Cari transaksi sukses berdasarkan student dan course
const findSuccessfulTransaction = async (studentId, courseId) => {
  return await prisma.transaction.findFirst({
    where: {
      student_id: studentId,
      course_id: courseId,
      status: 'SUCCESS',
    },
  });
};

// Cek apakah mahasiswa sudah terdaftar di kelas tersebut
const findEnrollment = async (studentId, courseId) => {
  return await prisma.enrollment.findUnique({
    where: {
      student_id_course_id: {
        student_id: studentId,
        course_id: courseId,
      },
    },
  });
};

// Eksekusi masuk kelas
const createEnrollment = async (studentId, courseId) => {
  return await prisma.enrollment.create({
    data: {
      student_id: studentId,
      course_id: courseId,
      progress: 0,
      is_completed: false,
    },
    include: {
      course: {
        select: { title: true, type: true }
      }
    }
  });
};

module.exports = {
  findCourseById,
  findSuccessfulTransaction,
  findEnrollment,
  createEnrollment,
};