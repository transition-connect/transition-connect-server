'use strict';

let nodemailer = require('nodemailer');
let _ = require('lodash');
let transporter;
let domain = require('../domain');
let logger = require('../logging').getLogger(__filename);
let bluebird = require('bluebird');
let BluebirdPromise = bluebird.Promise;

let emailTemplates = require('./templates').emailTemplates;

let config = function (conf) {
    let nodemailerConfig = {
        host: conf.host,
        port: conf.port,
        secure: conf.secure
    };
    if (conf.auth && conf.auth.user) {
        nodemailerConfig.auth = {
            user: conf.auth.user,
            pass: conf.auth.pass
        };
    }
    transporter = nodemailer.createTransport(nodemailerConfig);
};

let closeTempFiles = function (files) {
    if (_.isArray(files)) {
        files.forEach(function (file) {
            file.removeCallback();
        });
    }
};

let renderEMailAndSend = function (template, templateData, sendTo, attachments, subject, tempFiles, resolve, reject) {
    emailTemplates[template].template.render(templateData, function (error, results) {
        if (error) {
            closeTempFiles(tempFiles);
            logger.error(error);
            reject();
        } else {
            logger.info('Email sent from: ' + domain.getEMailSenderAddress());
            transporter.sendMail({
                from: `${domain.getEMailSenderAddress()}`, to: sendTo, subject: subject,
                text: results.text, html: results.html, attachments: attachments
            }, function (errorSendMail) {
                closeTempFiles(tempFiles);
                if (errorSendMail) {
                    logger.error(errorSendMail);
                    reject();
                } else {
                    logger.info('Email sent to: ' + sendTo);
                    resolve();
                }
            });
        }
    });
};

let sendEMail = function (template, templateData, sendTo) {
    return new BluebirdPromise(function (resolve, reject) {
        if (emailTemplates.hasOwnProperty(template)) {
            let attachments = emailTemplates[template].attachments, subject = emailTemplates[template].subject, tempFiles = null;

            if (emailTemplates[template].hasOwnProperty('preProcessing')) {
                let preProcessingResults = emailTemplates[template].preProcessing(templateData, emailTemplates[template].attachments);
                attachments = preProcessingResults.attachments;
                subject = preProcessingResults.subject;
                tempFiles = preProcessingResults.tempFiles;
            }
            renderEMailAndSend(template, templateData, sendTo, attachments, subject, tempFiles, resolve, reject);
        } else {
            logger.error("Message could not be sent. Template does not exist: " + template);
            reject();
        }
    });
};

module.exports = {
    config: config,
    sendEMail: sendEMail
};
