module.exports = function (grunt, options) {
    return {
        coverage: {
            files: {
                'report/output/directory': ['static/src/javascripts/**/*.js', 'static/test/javascripts/spec/**/*.js']
            }
        }
    };
};
