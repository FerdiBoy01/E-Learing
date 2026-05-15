const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API untuk Autentikasi Pengguna
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Mendaftarkan akun baru (Mahasiswa/Dosen)
 *     tags: [Auth]
 *     security: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mahasiswa Baru
 *               email:
 *                 type: string
 *                 example: maba@student.kampus.ac.id
 *               password:
 *                 type: string
 *                 example: password123
 *               nim_nip:
 *                 type: string
 *                 example: 20260001
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Validasi error atau email sudah terdaftar
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login untuk mendapatkan token JWT
 *     tags: [Auth]
 *     security: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: dosen@kampus.ac.id
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil mengembalikan token dan data user
 *       401:
 *         description: Email atau password salah
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Mengambil data profil user yang sedang login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Berhasil mengambil data profil
 *       401:
 *         description: Tidak ada token atau token tidak valid
 */
router.get('/me', protect, authController.getMe);

module.exports = router;