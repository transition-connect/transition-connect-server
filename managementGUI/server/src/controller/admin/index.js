"use strict";

let auth = require('../../lib/auth');

module.exports = function (router) {

    router.get('/*', auth.isAuthenticated(), function (req, res) {

        res.render('admin', {isProduction: process.env.NODE_ENV === 'production'});
    });
};
