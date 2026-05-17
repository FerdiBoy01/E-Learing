const { z } = require("zod");

// Validasi untuk Register
const registerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi coy!"),
  email: z.string().email("Format email tidak valid!"),
  password: z.string().min(6, "Password minimal 6 karakter!"),
  // 🔥 INI KUNCI UTAMANYA BIAR ROLE BISA MASUK
  role: z
    .enum(["STUDENT", "LECTURER", "CREATOR", "ADMIN"])
    .optional()
    .default("STUDENT"),
  nim_nip: z.string().nullable().optional(),
});

// Validasi untuk Login
const loginSchema = z.object({
  email: z.string().email("Format email tidak valid!"),
  password: z.string().min(1, "Password tidak boleh kosong!"),
});

module.exports = { registerSchema, loginSchema };
