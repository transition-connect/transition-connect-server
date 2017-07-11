"use strict";

module.exports = function (router) {

    router.get('/*', function (req, res) {

        if (req.isAuthenticated()) {
            res.redirect('/admin');
        } else {
            res.render('index', {isProduction: process.env.NODE_ENV === 'production'});
        }
    });
};
