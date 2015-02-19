import collectionsLoader from 'test/utils/collections-loader';
import configLoader from 'test/utils/config-loader';
import ko from 'knockout';
import { reset as resetListManager } from 'modules/list-manager';
import mediator from 'utils/mediator';
import 'mock/lastmodified';

var loaders = {
    'collections': collectionsLoader,
    'config': configLoader
};

export function sandbox (what) {
    var running;

    afterAll(function () {
        ko.cleanNode(window.document.body);
        running.unload();
        mediator.removeAllListeners();
        resetListManager();
    });

    return function (description, test) {
        it(description, function (done) {
            // Prevent pressing on fronts, it messes up with other tests
            mediator.removeEvent('presser:detectfailures');

            if (!running) {
                running = loaders[what]();
            }

            running.loader.then(function () {
                test(done);
            });
        });
    };
}
