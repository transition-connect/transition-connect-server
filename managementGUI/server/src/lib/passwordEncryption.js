'use strict';

let time = require('server-lib').time;
const VALID_TIME = 600; // 10 Minutes

let comparePassword = function (password, dbPassword, passwordCreated) {
    return password === dbPassword && time.getNowUtcTimestamp() <= passwordCreated + VALID_TIME;
};

module.exports = {
    comparePassword: comparePassword
};
