//Dùng để thông báo khi auth thành công và khi auth không thành công

/** @returns {Response} */
module.exports = ({
  res,
  success = true,
  statusCode = 200,
  message = null,
  payload = null,
}) => {
  res.status(statusCode).json({
    code: statusCode,
    success,
    message,
    payload,
  });
};
