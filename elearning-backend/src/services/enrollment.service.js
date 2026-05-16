const enrollmentRepository = require('../repositories/enrollment.repository');
const AppError = require('../utils/AppError');

const enrollStudent = async (studentId, courseId, accessCode) => {
  // 1. Cari data kelasnya
  const course = await enrollmentRepository.findCourseById(courseId);
  if (!course) {
    throw new AppError('Kelas tidak ditemukan.', 404);
  }

  // 2. Cek apakah kelas sudah di-publish
  if (!course.is_published) {
    throw new AppError('Kelas ini belum dirilis untuk umum.', 403);
  }

  // 3. Cek Status Kunci (PRIVATE) -> Fitur untuk Dosen
  if (course.visibility === 'PRIVATE') {
    if (!accessCode || course.access_code !== accessCode) {
      throw new AppError('Kode akses kelas salah atau tidak diberikan!', 403);
    }
  }

  // 4. Cek Status Pembayaran (PROJECT_BASED & Berbayar) -> Fitur untuk Programmer
  if (course.type === 'PROJECT_BASED' && course.price > 0) {
    const transaction = await enrollmentRepository.findSuccessfulTransaction(studentId, courseId);
    if (!transaction) {
      throw new AppError('Akses ditolak! Anda harus membeli kelas ini terlebih dahulu.', 402); // 402 Payment Required
    }
  }

  // 5. Cek apakah mahasiswa sudah pernah enroll (mencegah duplikat)
  const existingEnrollment = await enrollmentRepository.findEnrollment(studentId, courseId);
  if (existingEnrollment) {
    throw new AppError('Anda sudah terdaftar di kelas ini.', 400);
  }

  // 6. Kalau lolos semua ujian, masukkan mahasiswa ke kelas!
  const newEnrollment = await enrollmentRepository.createEnrollment(studentId, courseId);
  return newEnrollment;
};

module.exports = {
  enrollStudent,
};