import pageConfig from 'config';
import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import vars from 'modules/vars';
import ammendedQueryStr from 'utils/ammended-query-str';
import mediator from 'utils/mediator';
import fetchSettings from 'utils/fetch-settings';
import globalListeners from 'utils/global-listeners';
import * as layoutFromUrl from 'utils/layout-from-url';
import parseQueryParams from 'utils/parse-query-params';
import updateScrollables from 'utils/update-scrollables';
import terminate from 'utils/terminate';
import * as listManager from 'modules/list-manager';
import * as droppable from 'modules/droppable';
import * as copiedArticle from 'modules/copied-article';
import modalDialog from 'modules/modal-dialog';
import * as newItems from 'models/collections/new-items';
import Layout from 'models/layout';
import 'models/widgets';

export default function () {

    var model = vars.model = {
        layout: null,
        alert: ko.observable(),
        modalDialog: modalDialog,
        switches: ko.observable(),
        fronts: ko.observableArray(),
        loadedFronts: ko.observableArray(),
        isPasteActive: ko.observable(false)
    };

    model.chooseLayout = function () {
        this.layout.toggleConfigVisible();
    };
    model.saveLayout = function () {
        this.layout.save();
    };
    model.cancelLayout = function () {
        this.layout.cancel();
    };

    model.pressLiveFront = function () {
        model.clearAlerts();
        mediator.emit('presser:live');
    };

    model.clearAlerts = function() {
        model.alert(false);
        mediator.emit('alert:dismiss');
    };

    model.title = ko.computed(function() {
        return pageConfig.priority + ' fronts';
    }, this);

    mediator.on('presser:stale', function (message) {
        model.alert(message);
    });

    mediator.on('front:loaded', function (front) {
        var currentlyLoaded = model.loadedFronts();
        currentlyLoaded[front.position()] = front;
        model.loadedFronts(currentlyLoaded);
    });
    mediator.on('front:disposed', function (front) {
        model.loadedFronts.remove(front);
    });
    mediator.on('copied-article:change', function (hasArticle) {
        model.isPasteActive(hasArticle);
    });

    this.init = function() {
        fetchSettings(function (config, switches) {
            var fronts;

            if (switches['facia-tool-disable']) {
                terminate();
                return;
            }
            model.switches(switches);


            vars.state.config = config;

            var frontInURL = parseQueryParams(window.location.search).front;
            fronts = frontInURL === 'testcard' ? ['testcard'] :
                _.chain(config.fronts)
                .map(function(front, path) {
                    return front.priority === vars.priority ? path : undefined;
                })
                .without(undefined)
                .without('testcard')
                .difference(vars.CONST.askForConfirmation)
                .sortBy(function(path) { return path; })
                .value();

            if (!_.isEqual(model.fronts(), fronts)) {
               model.fronts(fronts);
            }
        }, vars.CONST.configSettingsPollMs, true)
        .done(function() {
            model.layout = new Layout();

            var wasPopstate = false;
            window.onpopstate = function() {
                wasPopstate = true;
                model.layout.locationChange();
            };
            mediator.on('layout:change', function () {
                if (!wasPopstate) {
                    var serializedLayout = layoutFromUrl.serialize(model.layout.serializable());
                    if (serializedLayout !== parseQueryParams(window.location.search).layout) {
                        history.pushState({}, '', window.location.pathname + '?' + ammendedQueryStr('layout', serializedLayout));
                    }
                }
                wasPopstate = false;
            });

            ko.applyBindings(model);
            $('.top-button-collections').show();

            updateScrollables();
            globalListeners.on('resize', updateScrollables);
        });

        listManager.init(newItems);
        droppable.init();
        copiedArticle.flush();
    };

};
