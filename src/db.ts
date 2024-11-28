import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a pool of connections to the PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME, // Added the database parameter
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // Convert port to a number
});

// Query function to interact with the database
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error); // Log the error
    throw error; // Rethrow the error for upstream handling
  } finally {
    client.release(); // Always release the client back to the pool
  }
};
