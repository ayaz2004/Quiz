import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.comfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get("/", async(req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.send(`The database name is : ${result.rows[0].current_database}`)
})

//Error handling middleware  

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test`);
});