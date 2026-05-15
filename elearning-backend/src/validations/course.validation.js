const { z } = require('zod');

const createCourseSchema = z.object({
  title: z.string().min(3, 'Judul course minimal 3 karakter'),
  description: z.string().optional(),
  thumbnail_url: z.string().url('Format URL thumbnail tidak valid').optional(),
  
  // 🔥 TAMBAHAN UNTUK FITUR FREEMIUM
  type: z.enum(['REGULAR', 'PROJECT_BASED']).default('REGULAR'),
  price: z.number().int().min(0, 'Harga tidak boleh minus').default(0),
});

module.exports = { createCourseSchema };