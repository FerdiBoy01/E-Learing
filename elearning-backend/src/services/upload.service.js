const AppError = require('../utils/AppError');

const uploadFile = async (file, req) => {
  if (!file) {
    throw new AppError('File tidak ditemukan dalam request', 400);
  }

  // --- LOCAL STORAGE STRATEGY ---
  // Kita buat public URL yang bisa diakses oleh Frontend
  // Contoh output: http://localhost:5000/uploads/file-123.jpg
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/${file.filename}`;

  // --- NANTI JIKA PINDAH KE CLOUDINARY/S3 ---
  // const result = await cloudinary.uploader.upload(file.path);
  // const fileUrl = result.secure_url;
  // fs.unlinkSync(file.path); // Hapus file lokal setelah naik ke cloud

  return fileUrl;
};

module.exports = { uploadFile };