// const { connect } = require('mongoose');
// const { isDev, db } = require('../config');

// module.exports = async () => {
//   try {
//     const uri = isDev ? `mongodb://localhost:27017/${db.name}` : db.uri;
//     await connect(uri);

//     console.log('database connected');
//   } catch (error0) {
//     console.log(error0.message);
//   }
// };


const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;