/* global _: true */
define(['knockout'], function(ko) {
    return function(props, obj) {
        return _.reduce(props, function(obj, prop){
            obj[prop] = ko.observable();
            return obj;
        }, obj || {});
    };
});
