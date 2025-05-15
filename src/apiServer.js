const express = require('express');
const JobManager = require('./jobManager');
const StatsAnalyzer = require('./statsAnalyzer');
const logger = require('./logger');
const { ValidationError, JobError } = require('./errors');

class ApiServer {
    constructor(config) {
        this.app = express();
        this.app.use(express.json());
        this.jobManager = new JobManager(config);
        this.statsAnalyzer = new StatsAnalyzer(this.jobManager);
    }

    start(port) {
        this.app.post('/jobs', async (req, res) => {
            try {
                const { jobName, arguments: args } = req.body;
                if (!jobName || !Array.isArray(args)) {
                    throw new ValidationError('jobName and arguments (array) are required');
                }
                const jobId = await this.jobManager.createJob(jobName, args);
                res.status(201).json({ jobId, status: this.jobManager.getJobById(jobId).status });
            } catch (err) {
                logger.error(`POST /jobs error: ${err.message}`);
                res.status(err instanceof ValidationError ? 400 : 500).json({ error: err.message });
            }
        });

        this.app.get('/jobs', (req, res) => {
            try {
                res.json(this.jobManager.getJobs());
            } catch (err) {
                logger.error(`GET /jobs error: ${err.message}`);
                res.status(500).json({ error: 'Failed to retrieve jobs' });
            }
        });

        this.app.get('/stats', (req, res) => {
            try {
                res.json(this.statsAnalyzer.analyze());
            } catch (err) {
                logger.error(`GET /stats error: ${err.message}`);
                res.status(500).json({ error: 'Failed to generate stats' });
            }
        });

        this.app.listen(port, () => {
            logger.info(`Server running on http://localhost:${port}`);
        });
    }
}

module.exports = ApiServer;
