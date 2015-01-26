module.exports = function(grunt, options) {
    return {
        dist: {
            options: {
                report: 'min'
            },
            files: [{
                expand: true,
                cwd: options.staticTargetDir + 'stylesheets/',
                src: ['*.css'],
                dest: options.staticTargetDir + 'stylesheets/'
            }]
        }
    };
};
