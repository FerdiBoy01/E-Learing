const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) response.meta = meta; // Berguna untuk fitur pagination nanti

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess };