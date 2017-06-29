"use strict";

module.exports = function (router) {

    router.get('/', function (req, res) {

        res.render('index', {isProduction: process.env.NODE_ENV === 'production'});
    });
};
