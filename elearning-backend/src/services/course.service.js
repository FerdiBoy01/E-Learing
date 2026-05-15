const courseRepository = require('../repositories/course.repository');
const AppError = require('../utils/AppError');

const createCourse = async (courseData, lecturerId) => {
  // 🔥 LOGIKA BISNIS: Pastikan kalau REGULAR, harganya wajib 0 (Gratis)
  let finalPrice = courseData.price ? parseInt(courseData.price) : 0;
  
  if (courseData.type === 'REGULAR') {
    finalPrice = 0;
  }

  // Gabungkan data input dengan ID dosen yang sedang login
  const newCourseData = {
    ...courseData,
    price: finalPrice, // Override harga dengan yang sudah divalidasi
    lecturer_id: lecturerId,
  };

  return await courseRepository.createCourse(newCourseData);
};

const getAllCourses = async () => {
  return await courseRepository.getAllCourses();
};

const getCourseById = async (id) => {
  const course = await courseRepository.getCourseById(id);
  
  if (!course) {
    throw new AppError('Mata kuliah tidak ditemukan', 404);
  }
  
  return course;
};

module.exports = { createCourse, getAllCourses, getCourseById };