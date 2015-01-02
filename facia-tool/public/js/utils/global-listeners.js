/* globals _ */
define(function () {
    var registeredListeners = {};

    function registerListener (event, callback) {
        if (!registeredListeners[event]) {
            registeredListeners[event] = [];
            (event === 'resize' ? $(window) : $('document, body')).on(event, handle.bind(null, event));
        }

        registeredListeners[event].push(callback);
    }

    function handle (event, eventObject) {
        return !_.find(registeredListeners[event], function (callback) {
            // Stop when a callback return false
            return callback(eventObject) === false;
        });
    }

    return {
        on: registerListener
    };
});
