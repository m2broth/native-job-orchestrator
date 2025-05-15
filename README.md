# Concurrent Job Manager

A Node.js backend service for launching, monitoring, and managing concurrent native processing jobs.

![Node.js](https://img.shields.io/badge/Node.js-v16%2B-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## Overview

This service allows you to:
- Start and monitor multiple concurrent processing jobs
- Track job statuses and automatically retry failed jobs
- Collect and analyze statistics about job performance
- Expose a RESTful API for job management

The system is designed to handle native processes (like batch scripts or executables) and provides robust error handling and monitoring capabilities.

## Features

- **Concurrent Job Execution**: Run multiple jobs simultaneously
- **Automatic Job Recovery**: Failed jobs are automatically retried once
- **Status Tracking**: Monitor jobs in real-time (running, completed, crashed, retried)
- **Statistical Analysis**: Analyze patterns in job execution to identify factors affecting success rates
- **RESTful API**: Simple HTTP endpoints for job management
- **Cross-platform Support**: Works on both Windows and Unix-based systems

## API Reference

### Endpoints

#### `POST /jobs`

Start a new job.

**Request Body**:
```json
{
  "jobName": "my-task-42",
  "arguments": [
    "arg1",
    "arg2"
  ]
}
```

**Response**:
```json
{
  "jobId": "job-0",
  "status": "running"
}
```

#### `GET /jobs`

Get a list of all jobs and their statuses.

**Response**:
```json
[
  {
    "jobId": "job-0",
    "jobName": "my-task-42",
    "args": ["arg1", "arg2"],
    "status": "completed",
    "retries": 0,
    "exitCode": 0,
    "duration": 1234
  }
]
```

#### `GET /stats`

Get statistical insights about job execution patterns.

**Response**:
```json
{
  "totalJobs": 25,
  "overallSuccessRate": 0.72,
  "patterns": [
    {
      "pattern": "Job name length > 10",
      "matchCount": 12,
      "successRate": 0.83,
      "differenceFromAverage": "+15%"
    },
    {
      "pattern": "Job execution time > 1 second",
      "matchCount": 8,
      "successRate": 0.63,
      "differenceFromAverage": "-13%"
    }
  ]
}
```

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/concurrent-job-manager.git
   cd concurrent-job-manager
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure the job execution script:

   **Option 1**: Create a `.env` file in the root directory:
   ```
   JOB_SCRIPT_PATH=path/to/your/script.bat
   PORT=3000
   ```
   
   **Option 2**: Set environment variables directly:
   ```
   # Windows
   set JOB_SCRIPT_PATH=path/to/your/script.bat
   set PORT=3000
   
   # Unix/Linux/macOS
   export JOB_SCRIPT_PATH=path/to/your/script.sh
   export PORT=3000
   ```

4. Start the server:
   ```
   npm start
   ```

## Testing

### Using curl

```bash
# Start a new job
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"jobName":"task-123","arguments":["input1","output2"]}'

# Get all jobs
curl http://localhost:3000/jobs

# Get statistics
curl http://localhost:3000/stats
```

### Using Postman

Import the included Postman collection (`postman_collection.json`) for easy API testing.

## Logging

Logs are stored in the `logs/app.log` file. You can monitor this file for detailed information about job execution and server status.

## Architecture

This service follows a modular architecture:

- **ApiServer**: Handles HTTP requests and manages API endpoints
- **JobManager**: Manages job creation, monitoring, and retry logic
- **Job**: Represents a single job instance and handles process spawning
- **StatsAnalyzer**: Analyzes job patterns and success rates

## License

This project is licensed under the MIT License - see the LICENSE file for details.
