const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config({
  path: 'variables.env'
});

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// express middleware to handle cookie JWT
server.express.use(cookieParser());

// JWT decoding
server.express.use((req, res, next) => {
  const { token } = req.cookies;

  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    req.userId = userId;
  }

  next();
});

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONT_END_URL
    }
  },
  deets => {
    console.log(`🚀 Server is now running on port ${deets.port} 🚀`);
  }
);
