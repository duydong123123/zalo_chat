const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const UserModel = require('../db/models/user');
const ProfileModel = require('../db/models/profile');
const SettingModel = require('../db/models/setting');
const GroupModel = require('../db/models/group');
const ContactModel = require('../db/models/contact');

const response = require('../helpers/response');
const mailer = require('../helpers/mailer');

const encrypt = require('../helpers/encrypt');
const decrypt = require('../helpers/decrypt');

exports.register = async (req, res) => {
  try {
    // tạo mã otp
     const otp = 1111;
    //  Math.floor(1000 + Math.random() * 9000);
    

    const { _id: userId } = await new UserModel({
      ...req.body,
      password: encrypt(req.body.password),
      otp, // -> password 1 lần
    }).save();

    // setting của tài khoàn
    await new SettingModel({ userId }).save();
    // lưu dữ liệu user vào model profile
    await new ProfileModel({
      ...req.body,
      userId,
      fullname: req.body.username,
    }).save();

    // tạo access token
    const token = jwt.sign({ _id: userId }, 'shhhhh');
    const template = fs.readFileSync(
      path.resolve(__dirname, '../helpers/templates/otp.html'),
      'utf8'
    );

    // gửi otp đến emai của user
    await mailer({
      to: req.body.email,
      fullname: req.body.username,
      subject: 'Active tài khoản của bạn',
      html: template,
      otp,
    });

    response({
      res,
      statusCode: 201,
      message: 'Tạo tài khoản thành công',
      payload: token,
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

exports.verify = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // tìm user bằng _id hoặc OTP.
    // Nếu tìm thấy user, update verify và OTP input
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, otp },
      { $set: { verified: true, otp: null } }
    );

    // Nếu tìm thấy user 
    if (!user) {
      //  gửi thông báo mã OTP sai
      const errData = {
        message: 'Mã OTP không hợp lệ',
        statusCode: 401,
      };
      throw errData;
    }

    response({
      res,
      message: 'Xác nhận mật khẩu thành công',
      payload: user,
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

exports.login = async (req, res) => {
  try {
    const errData = {};
    const { username, password } = req.body;

    const user = await UserModel.findOne({
      $or: [
        { email: username }, // input có thể điền username hoặc email
        { username },
      ],
    });

    // trường hợp không tìm thấy user
    if (!user) {
      errData.statusCode = 401;
      errData.message = 'tên tài khoản hoặc email chưa được đăng ký';

      throw errData;
    }
    // giải mã mật khẩu
    decrypt(password, user.password);
    // tạo token access
    const token = jwt.sign({ _id: user._id }, 'shhhhh');

    response({
      res,
      statusCode: 200,
      message: 'Đăng nhập thành công',
      payload: token, 
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

exports.find = async (req, res) => {
  try {
    // tìm user 
    const user = await UserModel.findOne(
      { _id: req.user._id },
      { password: 0 }
    );
    response({
      res,
      payload: user,
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

exports.delete = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findOne({ _id: userId });
    const compare = decrypt(req.body.password, user.password);

    if (!compare) {
      const errData = {
        message: 'mật khẩu không hợp lệ',
        statusCode: 401,
      };
      throw errData;
    }

    // xóa user, profile, setting, và contact 
    await UserModel.deleteOne({ _id: userId });
    await ProfileModel.deleteOne({ userId });
    await SettingModel.deleteOne({ userId });
    await ContactModel.deleteMany({ userId });

    await GroupModel.updateMany(
      { participantsId: userId },
      { $pull: { participantsId: userId } }
    );

    response({
      res,
      message: 'Đã xóa tài khoản thành công',
      payload: user,
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

exports.changePass = async (req, res) => {
  try {
    const errData = {};
    const userId = req.user._id;
    const { oldPass, newPass, confirmNewPass } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    // so sánh mật khẩu
    if (!decrypt(oldPass, user.password)) {
      errData.statusCode = 401;
      errData.message = 'Mật khẩu không hợp lệ';

      throw errData;
    }

    if (newPass !== confirmNewPass) {
      errData.statusCode = 400;
      errData.message = "Mật khẩu xác nhận không trùng";

      throw errData;
    }

    // thay đổi mật khẩu
    await UserModel.updateOne(
      { _id: userId },
      { $set: { password: encrypt(newPass) } }
    );

    
    delete user.password;
    response({
      res,
      message: 'Thay đổi mật khẩu thành công',
      payload: user,
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
