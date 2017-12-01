'use strict';

let path = require('path');
let EmailTemplate = require('email-templates').EmailTemplate;
let templatesDir = path.resolve(__dirname, 'templates');
let emailTemplates = {
    sendLoginPassword: {
        template: new EmailTemplate(path.join(templatesDir, 'sendLoginPassword')),
        subject: 'Transition Connect Passwort',
        attachments: []
    },
    adminCreated: {
        template: new EmailTemplate(path.join(templatesDir, 'adminCreated')),
        subject: 'Willkommen auf Transition Connect',
        attachments: []
    }
};

module.exports = {
    emailTemplates: emailTemplates
};
