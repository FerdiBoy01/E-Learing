const express = require('express');
const userController = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(protect); // Wajib login

router.get('/me', userController.getMyProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;