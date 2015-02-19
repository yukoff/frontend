import pageConfig from 'config';
import ko from 'knockout';
import _ from 'underscore';
import vars from 'modules/vars';
import * as listManager from 'modules/list-manager';
import * as droppable from 'modules/droppable';
import fetchSettings from 'utils/fetch-settings';
import updateScrollables from 'utils/update-scrollables';
import cloneWithKey from 'utils/clone-with-key';
import findFirstById from 'utils/find-first-by-id';
import logger from 'utils/logger';
import Group from 'models/group';
import Front from 'models/config/front';
import Collection from 'models/config/collection';
import * as newItems from 'models/config/new-items';
import persistence from 'models/config/persistence';

export default function () {
    var model = vars.model = {};

    model.title = ko.observable(pageConfig.priority + ' fronts configuration');

    model.switches = ko.observable();

    model.navSections = [].concat(pageConfig.navSections);

    model.collections = ko.observableArray();

    model.fronts = ko.observableArray();

    model.pinnedFront = ko.observable();

    model.pending = ko.observable();

    model.types =  _.pluck(vars.CONST.types, 'name');

    model.clipboard = new Group({
        parentType: 'Clipboard',
        keepCopy:  true
    });

    model.createFront = function() {
        var front;

        if (vars.model.fronts().length <= vars.CONST.maxFronts) {
            front = new Front({priority: vars.priority, isHidden: true});
            front.setOpen(true);
            model.pinnedFront(front);
            model.fronts.unshift(front);
        } else {
            window.alert('The maximum number of fronts (' + vars.CONST.maxFronts + ') has been exceeded. Please delete one first, by removing all its collections.');
        }
    };

    model.openFront = function(front) {
        _.each(model.fronts(), function(f){
            f.setOpen(f === front, false);
        });
    };

    model.createCollection = function() {
        var collection = new Collection();

        collection.toggleOpen();
        model.collections.unshift(collection);
    };

    function containerUsage() {
        return _.reduce(model.collections(), function(m, col) {
            var type = col.meta.type();

            if (type) {
                m[type] = _.uniq((m[type] || []).concat(
                    _.map(col.parents(), function(front) { return front.id(); })
                ));
            }
            return m;
        }, {});
    }

    function bootstrap(opts) {
        return fetchSettings(function (config, switches) {
            model.switches(switches);

            if (opts.force || !_.isEqual(config, vars.state.config)) {
                vars.state.config = config;

                model.collections(
                   _.chain(config.collections)
                    .map(function(obj, cid) { return new Collection(cloneWithKey(obj, cid)); })
                    .sortBy(function(collection) { return collection.meta.displayName(); })
                    .value()
                );

                model.fronts(
                   _.chain(_.keys(config.fronts))
                    .sortBy(function(id) { return id; })
                    .without(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                    .unshift(model.pinnedFront() ? model.pinnedFront().id() : undefined)
                    .filter(function(id) { return id; })
                    .map(function(id) {
                        var newFront = new Front(cloneWithKey(config.fronts[id], id)),
                            oldFront = findFirstById(model.fronts, id);

                        if (oldFront) {
                            newFront.state.isOpen(oldFront.state.isOpen());
                            newFront.state.isOpenProps(oldFront.state.isOpenProps());
                        }

                        return newFront;
                    })
                   .value()
                );

                logger.log('CONTAINER USAGE\n');
                _.each(containerUsage(), function(fronts, type) {
                    logger.log(type + ': ' + fronts.join(',') + '\n');
                });
            }
        }, opts.pollingMs, opts.terminateOnFail);
    }

    this.init = function(callback) {
        persistence.registerCallback(function () {
            bootstrap({
                force: true
            }).done(function () {
                vars.model.pending(false);
            });
        });

        bootstrap({
            pollingMs: vars.CONST.configSettingsPollMs,
            terminateOnFail: true

        }).done(function() {
            ko.applyBindings(model);

            updateScrollables();
            window.onresize = updateScrollables;
            callback();
        });

        listManager.init(newItems);
        droppable.init();
    };
}
