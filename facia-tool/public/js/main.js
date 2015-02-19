/* global console */
import Raven from 'raven-js';

export function load (module) {

    System.amdRequire(['config'], function (config) {
        Raven.config(config.sentryPublicDSN).install();
        Raven.setUser({
            email: config.email || 'anonymous'
        });

        System.amdDefine = Raven.wrap({deep: false}, System.amdDefine);
        // ES6 loader uses console.error to log un-handled rejected promises
        var originalConsole = window.console.error;
        window.console.error = function () {
            originalConsole.apply(window.console, arguments);
            Raven.captureMessage([].slice.apply(arguments).join(' '));
        };


        System.import('models/' + module + '/main').then(function (Module) {
            Module = Module.default;
            new Module().init();
        }, function (error) {
            Raven.captureException(error);
            console.error(error);
        });
    });
}
