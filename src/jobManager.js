const Job = require('./job');
const logger = require('./logger');
const { JobError } = require('./errors');

class JobManager {
    constructor(config) {
        this.jobs = new Map();
        this.jobIdCounter = 0;
        this.config = config || {
            JOB_SCRIPT_PATH: 'job.bat',
        };
        this.scriptPath = this.loadScriptPath();
    }

    loadScriptPath() {
        const scriptPath = this.config.JOB_SCRIPT_PATH;

        logger.info(`Using script path: ${scriptPath}`);
        return scriptPath;
    }

    generateJobId() {
        return `job-${this.jobIdCounter++}`;
    }

    async createJob(jobName, args) {
        if (typeof jobName !== 'string' || !Array.isArray(args)) {
            throw new JobError('jobName must be a string and arguments must be an array');
        }

        const jobId = this.generateJobId();
        const job = new Job(jobId, jobName, args, this.scriptPath);
        this.jobs.set(jobId, job);

        try {
            await job.start((name, args, scriptPath, retries) => {
                // handle retry logic
                const retryJob = new Job(this.generateJobId(), name, args, scriptPath, retries);
                this.jobs.set(retryJob.id, retryJob);
                retryJob.start((n, a, s, r) => {
                    logger.error(`Job ${retryJob.id} failed after max retries`);
                });
            });
            return jobId;
        } catch (err) {
            this.jobs.delete(jobId);
            throw err;
        }
    }

    getJobs() {
        return Array.from(this.jobs.values()).map(job => job.toJSON());
    }

    getJobById(jobId) {
        return this.jobs.get(jobId);
    }
}

module.exports = JobManager;
