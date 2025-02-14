# manyfold-metrics
Prometheus exporter for manyfold metrics

## Collected Metrics

The Manyfold Metrics Server exposes the following Prometheus metrics:

- **manyfold_user_count**: Total number of users in the system.
- **manyfold_library_count**: Total number of libraries.
- **manyfold_model_count**: Total number of models in the system.
- **manyfold_file_count**: Total number of files associated with models.
- **manyfold_tag_count**: Total number of tags.
- **manyfold_creator_count**: Total number of creators.
- **manyfold_models_per_tag**: The number of models per tag, with `tag_name` as a label.



# Setup

This project provides a metrics server that exposes various metrics related to the Manyfold application. These metrics can be scraped by Prometheus for monitoring purposes.

## Setup and Running the Server

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/ZoesDev/manyfold-metrics.git
cd manyfold-metrics
```

### 2. Install Dependencies

Next, install the necessary dependencies using npm:

```bash
npm install
```

This will install the required libraries and modules for running the server.

### 3. Set Up the Environment Variables

Create a `.env` file in the root directory of the project. You can copy and modify the following example:

```bash
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Server settings
PORT=3000
```

Make sure to replace the database settings with your actual database connection information.

### 4. Start the Server

Once you’ve installed the dependencies and configured your `.env` file, you can start the server by running:

```bash
npm start
```

The server will start running on port `3000` by default, but you can change this in the `.env` file.

### 5. Access the Metrics

After starting the server, you can access the Prometheus metrics at:

```
http://localhost:3000/metrics
```

You can configure Prometheus to scrape this endpoint to collect the metrics.

The root page (`http://localhost:3000/`) will also show a simple overview with the version number and a link to the metrics page.

