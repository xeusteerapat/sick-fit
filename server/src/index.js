const cookieParser = require('cookie-parser');
require('dotenv').config({
  path: 'variables.env'
});

const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// express middleware to handle cookie JWT
server.express.use(cookieParser());

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
