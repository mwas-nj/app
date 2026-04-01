// server/package.json
{
  "name": "omni-shop-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "socket.io": "^4.6.1",
    "twilio": "^4.11.0",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "multer": "^1.4.5-lts.1",
    "csv-parser": "^3.0.0",
    "express-rate-limit": "^6.7.0",
    "helmet": "^7.0.0",
    "compression": "^1.7.4"
  }
}