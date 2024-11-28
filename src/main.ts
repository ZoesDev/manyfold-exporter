import express from 'express';
import promClient from 'prom-client';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Declare versionInfo variable
let versionInfo: { version: string; commit: string; branch: string; buildDate: string };

// Get build info from the generated build-info.json
try {
  versionInfo = JSON.parse(fs.readFileSync('./build-info.json', 'utf8'));
} catch (error) {
  console.error('Error reading version info:', error);
  versionInfo = {
    version: 'unknown',
    commit: 'unknown',
    branch: 'unknown',
    buildDate: 'unknown',
  };
}

// Database connection (Assuming the use of a Pool)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Function to test database connection
async function connectToDatabase() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    client.release(); // Release client back to the pool
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

connectToDatabase();

// Prometheus setup
promClient.collectDefaultMetrics();

// Define version gauge for Prometheus
const versionGauge = new promClient.Gauge({
  name: 'app_version_info',
  help: 'Application version information',
  labelNames: ['version', 'commit', 'branch', 'build_date'],
});

// Set the version info in the gauge
versionGauge.set({
  version: versionInfo.version,
  commit: versionInfo.commit,
  branch: versionInfo.branch,
  build_date: versionInfo.buildDate,
}, 1);

// Express setup
const metricServer = express();

// /metrics endpoint
metricServer.get('/metrics', async (req, res) => {
  res.send(await promClient.register.metrics());
});

// Root endpoint showing version info
metricServer.get('/', (req, res) => {
  console.log('metrics homepage');
  res.send(`
    <header style='background-color: #ED72D7; color: #000; font-size: 1rem; padding: 1rem;'>
      <h1>Manyfold Exporter</h1>
    </header>
    <main style='padding: 1rem;'>
      <h2>Manyfold Metric Exporter</h2>
      <div>Version: ${versionInfo.version}</div>
      <div>Commit: ${versionInfo.commit}</div>
      <div>Branch: ${versionInfo.branch}</div>
      <div>Build Date: ${versionInfo.buildDate}</div>
      <div><a href='/metrics'>/metrics</a></div>
    </main>
  `);
});

// Start the server
const port = Number(process.env.SERVER_PORT) || 3000;
metricServer.listen(port, () =>
  console.log(`🚨 Prometheus listening on port ${port} /metrics`)
);
