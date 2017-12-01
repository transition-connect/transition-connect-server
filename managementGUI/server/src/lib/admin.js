'use strict';

let db = require('server-lib').neo4j;
let logger = require('server-lib').logging.getLogger(__filename);

let invalidatePasswordOfUser = function (id) {
    return db.cypher().match('(admin:Admin {adminId: {id}})')
        .set(`admin`, {passwordCreated: 0})
        .end({id: id}).send();
};

let searchAdminWithEmail = async function (email) {
    let queryEmail = `(?i)${email}`;
    let resp = await db.cypher().match('(admin:Admin)')
        .where(`admin.email =~ {email}`)
        .return('admin.password AS password, admin.passwordCreated AS passwordCreated, admin.adminId AS id,' +
            'admin.email AS email')
        .end({email: queryEmail}).send();
    if (resp.length === 1) {
        return resp[0];
    }
    if (resp.length > 1) {
        logger.error('More then one user with email address ' + email);
    }
};

module.exports = {
    serialize: function (user, done) {
        done(null, user.email);
    },
    deserialize: function (email, done) {
        return searchAdminWithEmail(email).then(function (user) {
            done(null, user);
        }).catch(function (err) {
            done(err, null);
        });
    },
    searchAdminWithEmail,
    invalidatePasswordOfUser
};
