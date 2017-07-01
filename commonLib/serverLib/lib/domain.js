'use strict';

let getDomain = function () {
    let domain = 'http://localhost:8080/';

    if (process.env.NODE_ENV === 'production') {
        domain = 'https://www.transition-connect.org/';
    }
    return domain;
};

let getEMailSenderAddress = function () {
    let address = 'info@localhost.localdomain';
    return address;
};

module.exports = {
    getDomain: getDomain,
    getEMailSenderAddress: getEMailSenderAddress
};
