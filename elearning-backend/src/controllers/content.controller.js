const contentService = require('../services/content.service');
const { sendSuccess } = require('../utils/responseHandler');
const AppError = require('../utils/AppError'); // Tambahkan import AppError
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createChapter = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const chapter = await contentService.addChapterToCourse(courseId, req.body);
    
    return sendSuccess(res, 201, 'Bab (Chapter) berhasil ditambahkan', { chapter });
  } catch (error) {
    next(error);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const material = await contentService.addMaterialToChapter(chapterId, req.body);
    
    return sendSuccess(res, 201, 'Materi berhasil ditambahkan', { material });
  } catch (error) {
    next(error);
  }
};

const getMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const material = await prisma.material.findUnique({ where: { id: materialId } });
    
    if (!material) return next(new AppError('Materi tidak ditemukan', 404));
    return sendSuccess(res, 200, 'Detail materi berhasil diambil', { material });
  } catch (error) {
    next(error);
  }
};

const deleteChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params; // Sesuai dengan rute /chapters/:chapterId
    
    await prisma.chapter.delete({
      where: { id: chapterId }
    });

    return res.status(200).json({ success: true, message: 'Bab berhasil dihapus permanen' });
  } catch (error) {
    console.error("Gagal Hapus Bab:", error);
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params; // Sesuai dengan rute /materials/:materialId
    
    await prisma.material.delete({
      where: { id: materialId }
    });

    return res.status(200).json({ success: true, message: 'Materi berhasil dihapus permanen' });
  } catch (error) {
    console.error("Gagal Hapus Materi:", error);
    next(error);
  }
};

const updateChapter = async (req, res, next) => {
  try {
    const { chapterId } = req.params;
    const { title, order_index } = req.body;

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: title,
        order_index: order_index !== undefined ? parseInt(order_index) : undefined
      }
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Bab berhasil diperbarui', 
      data: updatedChapter 
    });
  } catch (error) {
    console.error("Gagal Edit Bab:", error);
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    const { title, type, content, order_index } = req.body;

    // Deteksi cerdas agar hanya mengupdate data yang dikirim
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (order_index !== undefined) updateData.order_index = parseInt(order_index);

    const updatedMaterial = await prisma.material.update({
      where: { id: materialId },
      data: updateData
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Materi berhasil diperbarui', 
      data: updatedMaterial 
    });
  } catch (error) {
    console.error("Gagal Edit Materi:", error);
    next(error);
  }
};

// Pastikan getMaterial ikut di-export di sini ya coy!
module.exports = { createChapter, createMaterial, getMaterial, deleteChapter,
  deleteMaterial, updateChapter, updateMaterial };