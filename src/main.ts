import express from 'express';
import promClient from 'prom-client';
import { query } from './db';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

// Define Prometheus metrics
const userCount = new promClient.Gauge({ name: 'manyfold_user_count', help: 'Total number of users' });
const libraryCount = new promClient.Gauge({ name: 'manyfold_library_count', help: 'Total number of libraries' });
const modelCount = new promClient.Gauge({ name: 'manyfold_model_count', help: 'Total number of models' });
const fileCount = new promClient.Gauge({ name: 'manyfold_file_count', help: 'Total number of files' });
const tagCount = new promClient.Gauge({ name: 'manyfold_tag_count', help: 'Total number of tags' });
const creatorCount = new promClient.Gauge({ name: 'manyfold_creator_count', help: 'Total number of creators' });
const modelDownloads = new promClient.Gauge({ name: 'manyfold_model_downloads', help: 'Total downloads per model', labelNames: ['model_id'] });
const diskUsage = new promClient.Gauge({ name: 'manyfold_library_disk_usage', help: 'Disk space used per library', labelNames: ['library_id'] });

async function collectMetrics() {
    try {
        // Query user count
        const users = await query('SELECT COUNT(*) FROM users');
        userCount.set(users.rows[0].count);

        // Query library count
        const libraries = await query('SELECT COUNT(*) FROM libraries');
        libraryCount.set(libraries.rows[0].count);

        // Query model count
        const models = await query('SELECT COUNT(*) FROM models');
        modelCount.set(models.rows[0].count);

        // Query file count
        const files = await query('SELECT COUNT(*) FROM files');
        fileCount.set(files.rows[0].count);

        // Query tag count
        const tags = await query('SELECT COUNT(*) FROM tags');
        tagCount.set(tags.rows[0].count);

        // Query creator count
        const creators = await query('SELECT COUNT(*) FROM creators');
        creatorCount.set(creators.rows[0].count);

        // Query model downloads
        const downloads = await query('SELECT model_id, SUM(downloads) AS total_downloads FROM model_downloads GROUP BY model_id');
        downloads.rows.forEach(row => modelDownloads.set({ model_id: row.model_id }, row.total_downloads));

        // Query disk usage (assuming a table exists, otherwise replace with external disk check)
        const diskUsages = await query('SELECT library_id, disk_space_used FROM library_usage');
        diskUsages.rows.forEach(row => diskUsage.set({ library_id: row.library_id }, row.disk_space_used));
    } catch (error) {
        console.error('Error collecting metrics:', error);
    }
}

// Collect metrics every 30 seconds
setInterval(collectMetrics, 30000);

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

app.listen(3000, () => {
    console.log('Metrics server running on port 3000');
});
