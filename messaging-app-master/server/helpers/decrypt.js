const { compareSync } = require('bcrypt');

/**
 * giải mã data
 * @param {String} password
 * @param {String} hash
 * @returns {String|Boolean}
 */
module.exports = (password, hash) => {
  // so sánh password
  const match = compareSync(password, hash);

  // nếu password và hash password không trùng
  if (!match) {
    const errData = {
      statusCode: 401,
      message: 'mật khẩu không hợp lệ',
    };
    throw errData;
  }

  // trả lại password nếu trùng
  return password;
};
