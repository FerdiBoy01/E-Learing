const { z } = require('zod');

const createChapterSchema = z.object({
  title: z.string().min(3, 'Judul bab minimal 3 karakter'),
  order_index: z.number().int().min(1, 'Urutan bab harus dimulai dari 1'),
});

const createMaterialSchema = z.object({
  title: z.string().min(3, 'Judul materi minimal 3 karakter'),
  type: z.enum(['LESSON', 'QUIZ', 'CHALLENGE'], {
    errorMap: () => ({ message: 'Tipe harus LESSON, QUIZ, atau CHALLENGE' }),
  }),
  content: z.string().optional(), // Bisa string kosong jika tipenya CHALLENGE submission
  order_index: z.number().int().min(1, 'Urutan materi harus angka positif'),
});

module.exports = { createChapterSchema, createMaterialSchema };