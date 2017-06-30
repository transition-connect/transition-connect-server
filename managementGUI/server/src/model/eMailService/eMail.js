"use strict";
let emailQueue = require('server-lib').eMailQueue;
let sendLoginPasswordJob = require('./jobs/sendLoginPasswordJob');


let startEmailService = function () {
    emailQueue.addJobDefinition('sendLoginPasswordJob', sendLoginPasswordJob.processDefinition);
};

module.exports = {
    start: startEmailService
};
