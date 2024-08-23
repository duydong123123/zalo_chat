const { v4: uuidv4 } = require('uuid');
const ProfileModel = require('../db/models/profile');
const ContactModel = require('../db/models/contact');
const SettingModel = require('../db/models/setting');

const response = require('../helpers/response');

exports.insert = async (req, res) => {
  try {
    const errData = {};
    const { username, fullname } = req.body;
    // tìm profile bạn bè bằng username
    const friend = await ProfileModel.findOne({ username });

    // nếu  profile bạn bè không tìm thấy hoặc
    // hoặc contact đã có trong danh sách
    if (
      !friend ||
      (await ContactModel.findOne({
        userId: req.user._id,
        friendId: friend.userId,
      }))
    ) {
      errData.statusCode = 401;
      errData.message = !friend
        ? 'Không tìm thấy người dùng'
        : 'người này đã có trong danh sách liên lạc';

      throw errData;
    }

    // nếu contact của user đã được lưu bởi bạn bè
    const ifSavedByFriend = await ContactModel.findOne({
      userId: friend.userId,
      friendId: req.user._id,
    });

    const contact = await new ContactModel({
      userId: req.user._id,
      roomId: ifSavedByFriend ? ifSavedByFriend.roomId : uuidv4(),
      friendId: friend.userId,
      fullname: fullname || friend.fullname,
      bio: friend.bio,
      avatar: friend.avatar,
    }).save();

    response({
      res,
      statusCode: 201,
      message: 'Thêm liên hệ thành công',
      payload: contact,
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
    const setting = await SettingModel.findOne(
      { userId: req.user._id },
      { sortContactByName: 1 }
    );

    const contacts = await ContactModel.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'friendId',
          foreignField: 'userId',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
      {
        $sort: setting.sortContactByName
          ? { 'profile.fullname': 1 }
          : { 'profile.updatedAt': -1 },
      },
    ]).collation({ locale: 'en' });

    response({
      res,
      payload: contacts,
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

exports.deleteByFriendId = async (req, res) => {
  try {
    const { friendId } = req.params;
    await ContactModel.deleteOne({ userId: req.user._id, friendId });

    response({
      res,
      message: 'Xóa liên hệ thành công',
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
