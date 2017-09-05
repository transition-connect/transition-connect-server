'use strict';

let logger = require('server-lib').logging.getLogger(__filename);

module.exports = function (router) {

    router.post('/', function (req, res) {
        let env = process.env.NODE_ENV || 'development';
        logger.info('logout of admin', req, {});
        req.logout();
        if ('testing' !== env) {
            req.session.destroy();
        }
        res.status(200).end();
    });
};
