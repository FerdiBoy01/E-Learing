const courseRepository = require("../repositories/course.repository");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

const createNewCourse = async (data, user) => {
  // 1. Validasi Harga berdasarkan Tipe
  let finalPrice = data.price ? parseInt(data.price) : 0;
  if (data.type === "REGULAR") finalPrice = 0;

  // 2. Logika Visibility & Access Code
  let accessCode = null;
  if (data.visibility === "PRIVATE") {
    // Jika dosen bikin kelas privat tapi gak ngasih kode, kita generate otomatis
    accessCode =
      data.access_code || crypto.randomBytes(3).toString("hex").toUpperCase();
  }

  // 🔥 FIX: Parsing eksplisit untuk Gamifikasi agar masuk ke Database
  const newCourseData = {
    title: data.title,
    description: data.description,
    type: data.type,
    price: finalPrice,
    thumbnail_url: data.thumbnail_url,
    visibility: data.visibility,
    access_code: accessCode,
    reward_points: parseInt(data.reward_points) || 0, // Pastikan jadi angka
    reward_exp: parseInt(data.reward_exp) || 500, // Pastikan jadi angka
    lecturer_id: user.id,
    is_published: data.is_published || false,
  };

  return await courseRepository.createCourse(newCourseData);
};

const getCourseCatalog = async (user) => {
  let whereCondition = {};

  if (user.role === "STUDENT") {
    // Mahasiswa HANYA BISA melihat kelas yang sudah di-publish DAN publik
    whereCondition = { is_published: true, visibility: "PUBLIC" };
  } else if (user.role === "LECTURER" || user.role === "CREATOR") {
    // Dosen/Kreator hanya melihat kelas buatan MEREKA SENDIRI di dashboardnya
    whereCondition = { lecturer_id: user.id };
  } else if (user.role === "ADMIN") {
    // Admin bebas lihat semua
    whereCondition = {};
  }

  return await courseRepository.findCourses(whereCondition);
};

const getCourseDetail = async (id) => {
  const course = await courseRepository.findCourseById(id);
  if (!course) throw new AppError("Kelas tidak ditemukan", 404);
  return course;
};

const updateExistingCourse = async (id, data, user) => {
  const course = await courseRepository.findCourseById(id);
  if (!course) throw new AppError("Kelas tidak ditemukan", 404);

  // Pastikan HANYA pemilik kelas atau ADMIN yang bisa edit
  if (course.lecturer_id !== user.id && user.role !== "ADMIN") {
    throw new AppError("Akses ditolak! Anda bukan pemilik kelas ini.", 403);
  }

  return await courseRepository.updateCourse(id, data);
};

const deleteExistingCourse = async (id, user) => {
  const course = await courseRepository.findCourseById(id);
  if (!course) throw new AppError("Kelas tidak ditemukan", 404);

  // Pastikan HANYA pemilik kelas atau ADMIN yang bisa hapus
  if (course.lecturer_id !== user.id && user.role !== "ADMIN") {
    throw new AppError("Akses ditolak! Anda bukan pemilik kelas ini.", 403);
  }

  await courseRepository.deleteCourse(id);
  return true;
};

module.exports = {
  createNewCourse,
  getCourseCatalog,
  getCourseDetail,
  updateExistingCourse,
  deleteExistingCourse,
};
