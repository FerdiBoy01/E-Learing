const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const userRepository = require("../repositories/user.repository");
const AppError = require("../utils/AppError");

// 1. Middleware untuk mengecek apakah user sudah login (punya token valid)
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "Anda belum login. Silakan login untuk mendapatkan akses.",
          401,
        ),
      );
    }

    // Verifikasi token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Cek apakah user dengan ID tersebut masih ada di database
    const currentUser = await userRepository.findUserById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          "User yang memiliki token ini sudah tidak ada atau telah dihapus.",
          401,
        ),
      );
    }

    // 🔥 SECURITY LAYER 2: Tendang user yang JWT-nya masih aktif TAPI akunnya dibekukan!
    if (currentUser.role === "BANNED") {
      return next(
        new AppError(
          "Sesi Berakhir! Akun Anda telah dibekukan. Silakan hubungi pusat resolusi.",
          403,
        ),
      );
    }

    // Masukkan data user ke dalam object request (req) agar bisa dipakai di controller
    req.user = currentUser;
    next();
  } catch (error) {
    // Jika token expired atau tidak valid
    if (error.name === "JsonWebTokenError") {
      return next(
        new AppError("Token tidak valid. Silakan login kembali.", 401),
      );
    }
    if (error.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Token Anda sudah kadaluarsa. Silakan login kembali.",
          401,
        ),
      );
    }
    next(error);
  }
};

// 2. Middleware untuk membatasi akses berdasarkan Role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Cek apakah role user ada di dalam daftar role yang diizinkan
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "Anda tidak memiliki izin otoritas untuk melakukan aksi ini.",
          403,
        ),
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
