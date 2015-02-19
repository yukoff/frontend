import EventEmitter from 'EventEmitter';
import _ from 'underscore';

function Scope () {
    this.listeners = [];
}

var bus = new EventEmitter();

Scope.prototype.on = function(event, callback) {
    this.listeners.push([event, callback]);
    return bus.on(event, callback);
};

Scope.prototype.dispose = function () {
    _.each(this.listeners, function (pair) {
        bus.off(pair[0], pair[1]);
    });
};

export default bus;
export function scope () {
    return new Scope();
}
