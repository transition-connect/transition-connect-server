// https://github.com/Nikku/karma-browserify
module.exports = function (config) {
    config.set({
        browsers: ['PhantomJS'],
        plugins: [
            'karma-junit-reporter',
            'karma-phantomjs-launcher',
            'karma-browserify',
            'karma-mocha',
            'karma-sinon',
            'karma-chai',
        ],
        frameworks: ['browserify', 'mocha', 'chai', 'sinon'],
        files: [
            'src/admin/**/*.js',
            'test/public/unit/**/*.js',
            'test/admin/unit/**/*.js'
        ],
        reporters: ['junit'],
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
        junitReporter: {
            outputFile: '../TESTS-xunit.xml'
        },
        // if you want to continuously re-run tests on file-save,
        // replace the following line with `autoWatch: true`
        singleRun: true
    });
};
