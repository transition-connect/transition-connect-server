'use strict';

module.exports = function (grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.file.defaultEncoding = 'utf8';
    grunt.file.preserveBOM = true;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ['TESTS-xunit.xml'],
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
    });

    grunt.registerTask('test', ['clean', 'karma']);
};
