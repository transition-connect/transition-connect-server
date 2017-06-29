'use strict';

let getDomain = function () {
    let domain = 'http://localhost:8080/';

    if (process.env.NODE_ENV === 'production') {
        domain = 'https://www.myzel.org/';
    } else if (process.env.NODE_ENV === 'development') {
        domain = 'https://preview.myzel.org/';
    }
    return domain;
};

module.exports = {
    getDomain: getDomain
};
