const logger = require('./logger');

class StatsAnalyzer {
    constructor(jobManager) {
        this.jobManager = jobManager;
    }

    analyze() {
        const jobs = this.jobManager.getJobs();
        const totalJobs = jobs.length;
        if (totalJobs === 0) {
            return {
                totalJobs: 0,
                overallSuccessRate: 0,
                patterns: []
            };
        }

        const completedJobs = jobs.filter(job => job.status === 'completed').length;
        const overallSuccessRate = completedJobs / totalJobs;

        // Define patterns to analyze
        const patterns = [
            {
                pattern: 'Job name length > 10',
                matcher: job => job.jobName.length > 10,
                matchCount: 0,
                successCount: 0
            },
            {
                pattern: 'Argument count >= 2',
                matcher: job => job.args.length >= 2,
                matchCount: 0,
                successCount: 0
            },
            {
                pattern: 'Job name contains digits',
                matcher: job => /\d/.test(job.jobName),
                matchCount: 0,
                successCount: 0
            },
            {
                pattern: 'Job execution time > 1 second',
                matcher: job => job.duration && job.duration > 1000,
                matchCount: 0,
                successCount: 0
            },
            {
                pattern: 'Jobs that were retried',
                matcher: job => job.retries > 0,
                matchCount: 0,
                successCount: 0
            },
            {
                pattern: 'Job name starts with test-',
                matcher: job => job.jobName.startsWith('test-'),
                matchCount: 0,
                successCount: 0
            }
        ];

        // Analyze jobs
        jobs.forEach(job => {
            const isSuccess = job.status === 'completed';
            patterns.forEach(pattern => {
                if (pattern.matcher(job)) {
                    pattern.matchCount++;
                    if (isSuccess) pattern.successCount++;
                }
            });
        });

        // Format results
        const formattedPatterns = patterns.map(pattern => {
            const successRate = pattern.matchCount > 0 ? pattern.successCount / pattern.matchCount : 0;
            const differenceFromAverage = pattern.matchCount > 0
                ? ((successRate - overallSuccessRate) / overallSuccessRate * 100) || 0
                : 0;
            return {
                pattern: pattern.pattern,
                matchCount: pattern.matchCount,
                successRate: Number(successRate.toFixed(2)),
                differenceFromAverage: `${differenceFromAverage >= 0 ? '+' : ''}${differenceFromAverage.toFixed(0)}%`
            };
        });

        logger.info(`Generated stats: ${totalJobs} jobs, ${overallSuccessRate.toFixed(2)} success rate`);
        return {
            totalJobs,
            overallSuccessRate: Number(overallSuccessRate.toFixed(2)),
            patterns: formattedPatterns
        };
    }
}

module.exports = StatsAnalyzer;
