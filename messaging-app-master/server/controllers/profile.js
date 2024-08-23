const ProfileModel = require('../db/models/profile');
const ContactModel = require('../db/models/contact');
const response = require('../helpers/response');

exports.findById = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const friendProfile = targetId !== req.user._id;

    const profile = await ProfileModel.findOne({ userId: targetId });

    const contact = friendProfile
      ? await ContactModel.findOne({
          userId: req.user._id,
          friendId: targetId,
        })
      : false;

    response({
      res,
      payload: { ...profile._doc, saved: !!contact },
    });
  } catch (error0) {
    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};

// chỉnh sửa profile
exports.edit = async (req, res) => {
  try {
    const profile = await ProfileModel.updateOne(
      { userId: req.user._id },
      { $set: req.body } // -> object
    );

    response({
      res,
      message: 'Cập nhật thông tin thành công',
      payload: profile,
    });
  } catch (error0) {
    if (error0.name === 'MongoServerError' && error0.code === 11000) {
      switch (Object.keys(req.body)[0]) {
        case 'tentaikhoan':
          error0.message = 'tên tài khoản này đã được sử dụng';
          break;
        case 'sodienthoai':
          error0.message = 'số điện thoại này đã được sử dụng';
          break;
        default:
          break;
      }
    }

    response({
      res,
      statusCode: error0.statusCode || 500,
      success: false,
      message: error0.message,
    });
  }
};
