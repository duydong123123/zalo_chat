require('dotenv').config({ path: './.env' });

const express = require('express');
const { Server: SocketServer } = require('socket.io');

//Tạo http server
const http = require('http');

const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const config = require('./config');
const db = require('./db/connect');
const cloudinary = require('./middleware/cloudinary');

const app = express();

//Đưa app vào http server
const server = http.createServer(app);

// middleware
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({
    limit: '10mb',
    parameterLimit: 100000,
    extended: false,
  })
);

cloudinary();

//Sử dụng db
db();

//Sử dụng các API
app.use('/api', routes);

if (!config.isDev) {
  app.use(express.static('client/public'));
  const client = path.join(__dirname, '..', 'client', 'public', 'index.html');

  app.get('*', (req, res) => res.sendFile(client));
}

// lưu socket vào global object
global.io = new SocketServer(server, { cors: config.cors });
require('./socket');

module.exports = server;
