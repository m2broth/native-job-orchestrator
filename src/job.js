const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');
const { JobError } = require('./errors');

class Job {
    static Status = {
        RUNNING: 'running',
        COMPLETED: 'completed',
        CRASHED: 'crashed',
        RETRIED: 'retried'
    };

    constructor(id, name, args, scriptPath, retryCount = 0) {
        this.id = id;
        this.name = name;
        this.args = args;
        this.scriptPath = scriptPath;
        this.status = Job.Status.RUNNING;
        this.retries = retryCount;
        this.exitCode = null;
        this.startTime = Date.now();
        this.endTime = null;
    }

    async start(onRetry) {
        logger.info(`Starting job ${this.id} (${this.name}) with script ${this.scriptPath} and args: ${this.args.join(', ')}`);

        try {
            // Validate scriptPath
            try {
                await fs.access(this.scriptPath);
            } catch (err) {
                throw new JobError(`Script ${this.scriptPath} is not accessible: ${err.message}`);
            }

            const absoluteScriptPath = path.resolve(this.scriptPath);

            // Spawn the process
            const process = spawn('cmd.exe', ['/c', absoluteScriptPath, this.name, ...this.args], { stdio: 'inherit' });

            console.log(process);
            process.on('exit', (code) => {
                this.exitCode = code;
                this.endTime = Date.now();

                if (code === 0) {
                    this.status = Job.Status.COMPLETED;
                    logger.info(`Job ${this.id} completed successfully`);
                } else if (this.retries < 1) {
                    this.status = Job.Status.RETRIED;
                    logger.warn(`Job ${this.id} crashed, retrying...`);
                    onRetry(this.name, this.args, this.scriptPath, this.retries + 1);
                } else {
                    this.status = Job.Status.CRASHED;
                    logger.error(`Job ${this.id} crashed after ${this.retries} retries`);
                }
            });

            process.on('error', (err) => {
                this.status = Job.Status.CRASHED;
                this.endTime = Date.now();
                this.exitCode = -1;
                logger.error(`Job ${this.id} failed to spawn: ${err.message}`);
                throw new JobError(`Failed to spawn job ${this.id}: ${err.message}`);
            });
        } catch (err) {
            throw new JobError(`Job ${this.id} execution failed: ${err.message}`);
        }
    }

    toJSON() {
        return {
            jobId: this.id,
            jobName: this.name,
            args: this.args,
            scriptPath: this.scriptPath,
            status: this.status,
            retries: this.retries,
            exitCode: this.exitCode,
            duration: this.endTime && this.startTime ? this.endTime - this.startTime : null
        };
    }
}

module.exports = Job;
