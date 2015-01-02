/* globals _ */
define([
    'knockout',
    'utils/global-listeners',
    'utils/mediator'
],function (
    ko,
    globalListeners,
    mediator
) {
    function isNarrow (column) {
        var percentage = parseInt(column.style.width(), 10),
            width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

        return width * percentage / 100 <= 550;
    }

    function Column (opts) {
        var column = this;

        this.initialState = {
            'type': ko.observable(opts.type || 'front'),
            'config': ko.observable(opts.config)
        };
        this.edit = {};
        cloneObservables(this.initialState, this.edit);

        this.layout = opts.layout;
        this.style = {
            width: function () {
                return 100 / opts.layout.columns().length + 'vw';
            },
            left: function (data) {
                return 100 / opts.layout.columns().length * opts.layout.columns.indexOf(data) + 'vw';
            },
            isNarrow: ko.observable()
        };
        _.delay(function () {
            column.recomputeWidth();
        }, 25);

        function isType (what) {
            return this.edit.type() === what;
        }
        this.isFront = ko.computed(isType.bind(this, 'front'), this);
        this.isLatest = ko.computed(isType.bind(this, 'latest'), this);
        this.isOphan = ko.computed(isType.bind(this, 'ophan'), this);
        this.isIframe = ko.computed(isType.bind(this, 'iframe'), this);

        this.widgets = [];

        globalListeners.on('resize', _.debounce(function () {
            column.recomputeWidth();
        }, 25));
    }

    Column.prototype.setType = function (what) {
        if (this.edit.type() !== what) {
            this.edit.type(what);
            this.edit.config(undefined);
        }
        return this;
    };

    Column.prototype.setConfig = function (what) {
        this.edit.config(what);
        return this;
    };

    Column.prototype.reset = function (to) {
        var hasChanges = false;
        if (to.type !== this.edit.type()) {
            this.edit.type(to.type);
            hasChanges = true;
        }
        if (to.config !== this.edit.config()) {
            this.edit.config(to.config);
            hasChanges = true;
        }
        if (hasChanges) {
            this.saveChanges();
            mediator.emit('column:change', this);
        }
    };

    Column.prototype.saveChanges = function () {
        cloneObservables(this.edit, this.initialState);
        mediator.emit('layout:change');
    };

    Column.prototype.dropChanges = function () {
        cloneObservables(this.initialState, this.edit);
    };

    Column.prototype.serializable = function () {
        var serialized = {};
        _.chain(this.edit).keys().each(function (key) {
            var val = this.edit[key]();
            if (val !== undefined) {
                serialized[key] = val;
            }
        }, this);
        return serialized;
    };

    Column.prototype.recomputeWidth = function () {
        this.style.isNarrow(isNarrow(this));
    };

    Column.prototype.registerWidget = function (widget) {
        this.widgets.push(widget);
    };

    Column.prototype.focus = function (reference, forward) {
        if (!reference) {
            return _.find(this.widgets, function (widget) {
                return widget.focus && widget.focus();
            });
        } else {
            var position = _.indexOf(this.widgets, reference);
            if (position !== -1) {
                for (var i = position; i >= 0 && i < this.widgets.length; forward ? i += 1 : i -= 1) {
                    var widget = this.widgets[i];
                    if (widget.focus(forward)) {
                        console.log('focus says yes');
                        return widget;
                    }
                }
            }
            console.log('return the reference');
            return reference;
        }
    };

    Column.prototype.focusTarget = function (reference, focus, forward) {
        if (!reference) {
            return _.find(this.widgets, function (widget) {
                return widget.focusTarget && widget.focusTarget(forward, focus);
            });
        } else {
            var position = _.indexOf(this.widgets, reference);
            if (position !== -1) {
                for (var i = position; i >= 0 && i < this.widgets.length; forward ? i += 1 : i -= 1) {
                    var widget = this.widgets[i];
                    if (widget.focusTarget(forward)) {
                        return widget;
                    }
                }
            }
            return reference;
        }
    };

    function cloneObservables (object, into) {
        _.chain(object).keys().each(function (key) {
            if (!into[key]) {
                into[key] = ko.observable(object[key]());
            } else if (into[key]() !==  object[key]()) {
                into[key](object[key]());
            }
        });
    }

    return Column;
});
