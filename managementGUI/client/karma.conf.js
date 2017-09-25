// https://github.com/Nikku/karma-browserify
module.exports = function (config) {
    config.set({
        browsers: ['PhantomJS'],
        frameworks: ['browserify', 'mocha', 'chai', 'sinon'],
        files: [
            'src/admin/**/*.js',
            'test/public/unit/**/*.js',
            'test/admin/unit/**/*.js'
        ],
        reporters: ['spec'],
        preprocessors: {
            'src/admin/**/*.js': ['browserify'],
            'test/public/unit/**/*.js': ['browserify'],
            'test/admin/unit/**/*.js': ['browserify']
        },
        browserify: {
            debug: true,
            // needed to enable mocks
            plugin: [require('proxyquireify').plugin]
        },
        // if you want to continuously re-run tests on file-save,
        // replace the following line with `autoWatch: true`
        singleRun: true
    });
};
