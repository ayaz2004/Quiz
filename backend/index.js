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
  res.send(new ApiResponse(200, { message: 'API is working!' }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', apiRoutes);
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});