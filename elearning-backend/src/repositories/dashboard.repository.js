const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getLecturerStats = async (lecturerId) => {
  // 1. Total Course yang dibuat oleh dosen ini
  const totalCourses = await prisma.course.count({
    where: { lecturer_id: lecturerId },
  });

  // 2. Total tugas mahasiswa yang masih menunggu penilaian (PENDING)
  // Query relasional yang dalam (Submission -> Material -> Chapter -> Course -> Lecturer)
  const pendingSubmissions = await prisma.submission.count({
    where: {
      status: 'PENDING',
      material: {
        chapter: {
          course: {
            lecturer_id: lecturerId,
          },
        },
      },
    },
  });

  // 3. Total tugas yang sudah dinilai (GRADED / REVISION)
  const gradedSubmissions = await prisma.submission.count({
    where: {
      status: { not: 'PENDING' },
      material: {
        chapter: {
          course: { lecturer_id: lecturerId },
        },
      },
    },
  });

  return { totalCourses, pendingSubmissions, gradedSubmissions };
};

const getStudentStats = async (studentId) => {
  // 1. Total materi yang sudah diselesaikan
  const completedMaterials = await prisma.studentProgress.count({
    where: { student_id: studentId, is_completed: true },
  });

  // 2. Total materi keseluruhan yang ada di platform
  const totalMaterials = await prisma.material.count();

  // 3. Total tugas milik mahasiswa ini yang masih PENDING dinilai dosen
  const pendingGrades = await prisma.submission.count({
    where: { student_id: studentId, status: 'PENDING' },
  });

  // 4. Kalkulasi persentase penyelesaian (opsional tapi keren untuk UI)
  const completionPercentage = totalMaterials === 0 ? 0 : Math.round((completedMaterials / totalMaterials) * 100);

  return { completedMaterials, totalMaterials, completionPercentage, pendingGrades };
};

module.exports = { getLecturerStats, getStudentStats };