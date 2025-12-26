import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { configDotenv } from 'dotenv';
import { ApiResponse } from './utils/apiResponse.js';

configDotenv();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(express.json());
app.use(bodyParser.json());

// Import common routes
import apiRoutes from './routes/index.js';

// Test route
app.get('/', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { message: 'API is working!' }, 'Welcome to Quiz API')
  );
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'healthy',
      uptime: process.uptime()
    }, 'Server is healthy')
  );
});

// API Routes
app.use('/api', apiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || []
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json(
    new ApiResponse(404, null, "Route not found")
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});