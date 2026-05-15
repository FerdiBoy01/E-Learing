const uploadService = require('../services/upload.service');
const { sendSuccess } = require('../utils/responseHandler');

const uploadSingleFile = async (req, res, next) => {
  try {
    // req.file didapatkan dari middleware multer
    const fileUrl = await uploadService.uploadFile(req.file, req);
    
    return sendSuccess(res, 200, 'File berhasil diunggah', { file_url: fileUrl });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadSingleFile };