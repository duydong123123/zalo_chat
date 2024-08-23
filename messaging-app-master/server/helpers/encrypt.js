const { hashSync, genSaltSync } = require('bcrypt');

/**
 * mã hóa data
 * @param {String|Object} target
 * @returns {String|Object}
 */
module.exports = (target = null) => {
  // nếu data là string
  if (typeof target === 'string') {
    // mã hóa string
    return hashSync(target, genSaltSync(10));
  }

  // nếu data là object
  const pass = {};

  Object.entries(target).forEach((elem) => {
    pass[elem[0]] = hashSync(elem[1], genSaltSync(10));
  });

  return pass;
};
