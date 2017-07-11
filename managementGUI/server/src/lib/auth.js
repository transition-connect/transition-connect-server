/**
 * Module that will handle our authentication tasks
 */
'use strict';

let admin = require('./admin');
let LocalStrategy = require('passport-local').Strategy;
let passwordEncryption = require('./passwordEncryption');
let logger = require('server-lib').logging.getLogger(__filename);

/**
 * A helper method to retrieve a user from a local DB and ensure that the provided password matches.
 * @param req
 * @param res
 * @param next
 */
exports.localStrategy = function () {

    return new LocalStrategy(function (adminEmail, password, done) {

        let dbUser;
        //Retrieve the user from the database by login
        admin.searchAdminWithEmail(adminEmail).then(function (user) {

            //If we couldn't find a matching user, flash a message explaining what happened
            if (!user) {
                logger.warn(`Admin ${adminEmail} could not be found on database`);
                return done(null, false, {
                    message: 'Login not found'
                });
            }
            dbUser = user;
            return passwordEncryption.comparePassword(password, user.password, user.passwordCreated);
        }).then(function (samePassword) {
            if (!samePassword) {
                logger.warn('Wrong password for user ' + adminEmail);
                return done(null, false, {
                    message: 'Incorrect Password'
                });
            }
            done(null, dbUser);
        }).catch(function (err) {
            logger.error(`Database error when looking for user on database ${adminEmail}`, {}, {error: err});
            return done(err);
        });
    });
};

exports.isAuthenticated = function () {
    return function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    };
};
