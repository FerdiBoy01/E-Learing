const { z } = require('zod');

const submitChallengeSchema = z.object({
  // Tipe datanya kita hapus aja karena udah gak relevan
  submission_url: z.string().url('Format URL GitHub tidak valid'),
  
  // 🔥 TAMBAHIN INI BIAR ZOD MENERIMA GAMBAR
  // .optional() atau string kosong (literal '') karena gambar ini sifatnya opsional
  image_url: z.string().url('Format URL gambar tidak valid').optional().or(z.literal('')),
});

const gradeSubmissionSchema = z.object({
  status: z.enum(['GRADED', 'REVISION'], {
    errorMap: () => ({ message: 'Status penilaian harus GRADED atau REVISION' }),
  }),
  score: z.number().int().min(0).max(100, 'Nilai maksimal 100').optional(),
  feedback: z.string().optional(),
});

module.exports = { submitChallengeSchema, gradeSubmissionSchema };