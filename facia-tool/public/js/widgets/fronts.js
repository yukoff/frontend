/* globals _ */
define([
    'config',
    'knockout',
    'models/collections/collection',
    'modules/vars',
    'utils/fetch-lastmodified',
    'utils/mediator',
    'utils/presser',
    'utils/update-scrollables'
], function (
    pageConfig,
    ko,
    Collection,
    vars,
    lastModified,
    mediator,
    presser,
    updateScrollables
) {
    function Front (params) {
        params.column.registerWidget(this);
        var frontId, listeners = mediator.scope();

        this.column = params.column;
        frontId = this.column.initialState.config();
        this.front = ko.observable(frontId);
        this.previousFront = frontId;
        this.frontAge = ko.observable();
        this.liveMode = ko.observable(false);
        this.position = params.position;
        this.collections = ko.observableArray();
        this.listeners = listeners;
        this.currentFocus = null;
        this.currentTarget = null;
        this.currentActive = null;


        this.front.subscribe(this.onFrontChange.bind(this));
        this.liveMode.subscribe(this.onModeChange.bind(this));

        var model = this;
        this.setFront = function(id) {
            model.front(id);
        };
        this.setModeLive = function() {
            model.liveMode(true);
        };

        this.setModeDraft = function() {
            model.liveMode(false);
        };
        this.previewUrl = ko.pureComputed(function () {
            var path = this.liveMode() ? 'http://' + vars.CONST.mainDomain : vars.CONST.previewBase;

            return vars.CONST.previewBase + '/responsive-viewer/' + path + '/' + this.front();
        }, this);

        this.pressLiveFront = function () {
            if (this.front()) {
                presser.pressLive(this.front());
            }
        };
        this.pressDraftFront = function () {
            if (this.front()) {
                presser.pressDraft(this.front());
            }
        };

        this.ophanPerformances = ko.pureComputed(function () {
            return vars.CONST.ophanFrontBase + encodeURIComponent('/' + this.front());
        }, this);

        this.alertFrontIsStale = ko.observable();
        this.uiOpenElement = ko.observable();
        this.uiOpenArticle = ko.observable();

        listeners.on('presser:lastupdate', function (front, date) {
            if (front === model.front()) {
                model.frontAge(date);
                if (pageConfig.env !== 'dev') {
                    var stale = _.some(model.collections(), function (collection) {
                        var l = new Date(collection.state.lastUpdated());
                        return _.isDate(l) ? l > date : false;
                    });
                    if (stale) {
                        mediator.emit('presser:stale', 'Sorry, the latest edit to the front \'' + front + '\' hasn\'t gone live.');
                    }
                }
            }
        });

        listeners.on('ui:open', function(element, article, front) {
            if (front !== model) {
                return;
            }
            if (model.uiOpenArticle() &&
                model.uiOpenArticle().group &&
                model.uiOpenArticle().group.parentType === 'Article' &&
                model.uiOpenArticle() !== article) {
                model.uiOpenArticle().close();
            }
            model.uiOpenArticle(article);
            model.uiOpenElement(element);
        });

        listeners.on('presser:live', function () {
            model.pressLiveFront();
        });

        listeners.on('alert:dismiss', function () {
            model.alertFrontIsStale(false);
        });

        listeners.on('column:change', function (column) {
            if (model.column === column) {
                model.front(column.initialState.config());
            }
        });

        this.setIntervals = [];
        this.setTimeouts = [];
        this.refreshCollections(vars.CONST.collectionsPollMs || 60000);
        this.refreshSparklines(vars.CONST.sparksRefreshMs || 60000);
        this.refreshRelativeTimes(vars.CONST.pubTimeRefreshMs || 60000);

        this.load(frontId);
        mediator.emit('front:loaded', this);
    }

    Front.prototype.load = function (frontId) {
        if (frontId !== this.front()) {
            this.front(frontId);
        }
        var model = this;

        this.collections(
            ((vars.state.config.fronts[frontId] || {}).collections || [])
            .filter(function(id) { return vars.state.config.collections[id]; })
            .filter(function(id) { return !vars.state.config.collections[id].uneditable; })
            .map(function(id){
                return new Collection(
                    _.extend(
                        vars.state.config.collections[id],
                        {
                            id: id,
                            alsoOn: _.reduce(vars.state.config.fronts, function(alsoOn, front, fid) {
                                if (fid !== frontId && front.collections.indexOf(id) > -1) {
                                    alsoOn.push(fid);
                                }
                                return alsoOn;
                            }, []),
                            front: model
                        }
                    )
                );
            })
        );

        this.getFrontAge({alertIfStale: true});
        updateScrollables();
    };

    Front.prototype.getFrontAge = function (opts) {
        opts = opts || {};
        var model = this;

        if (model.front()) {
            lastModified(model.front()).done(function (last) {
                model.frontAge(last.human);
                if (pageConfig.env !== 'dev') {
                    model.alertFrontIsStale(opts.alertIfStale && last.stale);
                }
            });
        } else {
            model.frontAge(undefined);
        }
    };

    Front.prototype.refreshCollections = function (period) {
        var length = this.collections().length || 1, model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list, index) {
                model.setTimeouts.push(setTimeout(function() {
                    list.refresh();
                }, index * period / length)); // stagger requests
            });
        }, period));
    };
    Front.prototype.refreshSparklines = function (period) {
        var length = this.collections().length || 1, model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list, index) {
                model.setTimeouts.push(setTimeout(function() {
                    list.refreshSparklines();
                }, index * period / length)); // stagger requests
            });
        }, period));
    };
    Front.prototype.refreshRelativeTimes = function (period) {
        var model = this;
        this.setIntervals.push(setInterval(function () {
            model.collections().forEach(function (list) {
                list.refreshRelativeTimes();
            });
            model.getFrontAge();
        }, period));
    };

    Front.prototype.onFrontChange = function (front) {
        if (front === this.previousFront) {
            // This happens when the page is loaded and the select is bound
            return;
        }
        this.previousFront = front;
        this.column.setConfig(front).saveChanges();

        this.load(front);

        if (!this.liveMode()) {
            this.pressDraftFront();
        }
    };

    Front.prototype.onModeChange = function () {
        _.each(this.collections(), function(collection) {
            collection.closeAllArticles();
            collection.populate();
        });

        if (!this.liveMode()) {
            this.pressDraftFront();
        }
    };

    Front.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };


    Front.prototype.focus = function (direction) {
        var allArticles = [],
            focusPosition = NaN,
            focused = null,
            nextId = 0,
            next = null;

        _.each(this.collections(), function (collection) {
            _.each(collection.groups, function (group) {
                _.each(group.items(), function (article) {
                    allArticles.push(article);
                    if (article.state.focus()) {
                        focused = article;
                        focusPosition = allArticles.length - 1;
                    }
                });
            });
        });

        if (focused) {
            if (direction === true) {
                nextId = focusPosition + 1;
            } else if (direction === false) {
                nextId = focusPosition - 1;
            } else {
                nextId = 0;
            }
        } else {
            nextId = 0;
        }
        next = allArticles[nextId];

        if (next) {
            if (focused) {
                focused.state.focus(false);
            }
            next.state.focus(true);
            next.dom.scrollIntoView(false);
            this.currentFocus = next;
            return true;
        }
        return focused;
    };

    Front.prototype.blur = function (active) {
        if (this.currentFocus) {
            this.currentFocus.state.focus(false);
            this.currentFocus = null;
        }
        if (this.currentTarget) {
            if (this.currentTarget.state) {
                this.currentTarget.state.underDrag(false);
            } else {
                this.currentTarget.underDrag(false);
            }
            this.currentTarget = null;
        }
    };

    Front.prototype.select = function () {
        _.find(this.collections(), function (collection) {
            return _.find(collection.groups, function (group) {
                return _.find(group.items(), function (article) {
                    if (article.state.focus()) {
                        article.state.focus(false);
                        article.state.selected(true);
                        this.currentActive = article;
                        return true;
                    }
                }, this);
            }, this);
        }, this);
    };

    Front.prototype.deselect = function () {
        if (this.currentActive) {
            this.currentActive.state.selected(false);
            this.currentActive = null;
        }
    };

    Front.prototype.focusTarget = function (direction) {
        var allDroppable = [],
            focusPosition = NaN,
            focused = null,
            nextId = 0,
            next = null,
            dom = null,
            active = NaN;

        _.each(this.collections(), function (collection) {
            _.each(collection.groups, function (group) {
                _.each(group.items(), function (article) {
                    allDroppable.push(article);
                    if (article.state.underDrag()) {
                        focused = article.state;
                        focusPosition = allDroppable.length - 1;
                    }
                    if (article.state.selected()) {
                        active = allDroppable.length - 1;
                    }
                });
                allDroppable.push(group);
                if (group.underDrag()) {
                    focused = group;
                    focusPosition = allDroppable.length - 1;
                }
            });
        });

        if (!focused) {
            focusPosition = active;
        }

        if (direction === true) {
            nextId = focusPosition + 1;
            if (nextId === active) {
                nextId += 1;
            }
        } else if (direction === false) {
            nextId = focusPosition - 1;
            if (nextId === active) {
                nextId -= 1;
            }
        } else {
            nextId = 0;
        }
        next = allDroppable[nextId];

        if (next) {
            if (focused) {
                focused.underDrag(false);
            }
            if (next.state) {
                next.state.underDrag(true);
            } else {
                next.underDrag(true);
            }
            next.dom.scrollIntoView(false);
            this.currentTarget = next;
            return true;
        }
        return false;
    };

    Front.prototype.dispose = function () {
        this.listeners.dispose();
        _.each(this.setIntervals, function (timeout) {
            clearInterval(timeout);
        });
        _.each(this.setTimeouts, function (timeout) {
            clearTimeout(timeout);
        });
        mediator.emit('front:disposed', this);
    };

    // TODO uh?
    Front.prototype.keyNav = {
        selected: false,
        message: function () {
            return 'Press <strong>enter</strong> to select and start dragging.';
        }
    }

    return Front;
});
