import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.config.js';
import { configDotenv } from 'dotenv';
import { ApiResponse } from './utils/apiResponse.js';

const app = express();
const PORT = process.env.PORT || 3000;

configDotenv();
initDB();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send(new ApiResponse(200, { message: 'API is working!' }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});