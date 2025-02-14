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

async function collectMetrics() {
    try {
        // Query user count
        const users = await query('SELECT COUNT(*)::int AS count FROM users');
        userCount.set(Number(users.rows[0].count));

        // Query library count
        const libraries = await query('SELECT COUNT(*)::int AS count FROM libraries');
        libraryCount.set(Number(libraries.rows[0].count));

        // Query model count
        const models = await query('SELECT COUNT(*)::int AS count FROM models');
        modelCount.set(Number(models.rows[0].count));

        // Query file count
        const files = await query('SELECT COUNT(*)::int AS count FROM model_files');
        fileCount.set(Number(files.rows[0].count));

        // Query tag count
        const tags = await query('SELECT COUNT(*)::int AS count FROM tags');
        tagCount.set(Number(tags.rows[0].count));

        // Query creator count
        const creators = await query('SELECT COUNT(*)::int AS count FROM creators');
        creatorCount.set(Number(creators.rows[0].count));

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
