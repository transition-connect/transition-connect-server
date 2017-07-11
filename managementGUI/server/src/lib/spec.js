'use strict';

let db = require('server-lib').databaseConfig;
let eMailQueue = require('server-lib').eMailQueue;
let eMail = require('server-lib').eMail;
let passport = require('passport');
let auth = require('./auth');
let admin = require('./admin');

module.exports = function (app) {

    let env = process.env.NODE_ENV || 'development';

    app.on('middleware:before:json', function () {
        if ('testing' !== env) {
            app.use(function (req, res, next) {
                if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
                    return res.redirect('https://' + req.headers.host + req.url);
                }
                next();
            });
        }
    });

    app.on('middleware:before:router', function () {
        app.use(passport.initialize());
        app.use(passport.session());
        //Tell passport to use our newly created local strategy for authentication
        passport.use(auth.localStrategy());
        //Give passport a way to serialize and deserialize a user. In this case, by the user's email address.
        passport.serializeUser(admin.serialize);
        passport.deserializeUser(admin.deserialize);
    });

    return {
        onconfig: function (config, next) {

            let dbConfig = config.get('databaseConfig'),
                emailConfig = config.get('emailConfig');

            db.config(dbConfig);
            eMailQueue.config(emailConfig);
            eMail.config(emailConfig.smtp);
            next(null, config);
        }
    };

};
