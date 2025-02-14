import express from 'express';
import promClient from 'prom-client';
import { query } from './db';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

// Load version from package.json (assuming package.json is at the project root)
const packageJsonPath = path.resolve(__dirname, '../package.json');  // Go up one level from the src folder
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

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
const modelsPerTag = new promClient.Gauge({ name: 'manyfold_models_per_tag', help: 'Number of models per tag', labelNames: ['tag_name'] });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));  // Assuming 'views' is at the root level, outside of 'src'

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

        // Query models per tag
        const modelsByTag = await query(`
            SELECT tags.name AS tag_name, COUNT(taggings.taggable_id)::int AS model_count
            FROM taggings
            JOIN tags ON taggings.tag_id = tags.id
            JOIN model_files ON taggings.taggable_id = model_files.id
            GROUP BY tags.name
        `);
        modelsByTag.rows.forEach(row => modelsPerTag.set({ tag_name: row.tag_name }, Number(row.model_count)));
    } catch (error) {
        console.error('Error collecting metrics:', error);
    }
}

// Collect metrics every 30 seconds
setInterval(collectMetrics, 30000);

// Root route with a link to /metrics and version info
app.get('/', (req, res) => {
    res.render('index', { version });
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

app.listen(3000, () => {
    console.log('Metrics server running on port 3000');
});
