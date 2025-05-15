require('dotenv').config();
const ApiServer = require('./src/apiServer');

const server = new ApiServer({
    JOB_SCRIPT_PATH: process.env.JOB_SCRIPT_PATH
});
server.start(process.env.PORT || 3000);
