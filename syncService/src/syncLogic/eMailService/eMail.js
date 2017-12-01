"use strict";
let emailQueue = require('server-lib').eMailQueue;
let adminCreatedJob = require('./jobs/adminCreatedJob');


let startEmailService = function () {
    emailQueue.addJobDefinition('adminCreatedJob', adminCreatedJob.processDefinition);
};

module.exports = {
    start: startEmailService
};
