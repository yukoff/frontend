define([
    'knockout',
    'utils/global-listeners',
    'modules/vars'
], function (
    ko,
    globalListeners,
    vars
) {
    var keycodes = {
        9: 'tab',
        13: 'enter',
        27: 'esc',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    var actions = {
        keydown: {
            focus: {
                left: function () {
                    return this.nextColumn(false);
                },
                right: function () {
                    return this.nextColumn(true);
                },
                up: function () {
                    return this.nextElement(false);
                },
                down: function () {
                    return this.nextElement(true);
                },
                enter: function () {
                    return this.selectElement();
                }
            },
            select: {
                left: function () {
                    return this.nextColumn(false);
                },
                right: function () {
                    return this.nextColumn(true);
                },
                up: function () {
                    return this.nextElement(false);
                },
                down: function () {
                    return this.nextElement(true);
                }
            },
            global: {
                esc: function () {
                    return this.cancel();
                }
            }
        }
    };

    function KeyNav () {
        this.mode = 'focus';

        // MODES
        this.focus = {
            column: null,
            element: null
        };
        this.select = {
            column: null,
            element: null
        };
        this.target = {
            column: null,
            element: null
        };

        this.help = ko.observable();

        globalListeners.on('keydown', this.keydown.bind(this));
    }

    KeyNav.prototype.keydown = function(event) {
        if (event.altKey || event.ctrlKey) {
            return;
        }

        var callback = actions.keydown[this.mode || 'focus'][keycodes[event.keyCode]];
        if (callback) {
            return callback.call(this);
        }

        callback = actions.keydown.global[keycodes[event.keyCode]];
        if (callback) {
            return callback.call(this);
        }
    };

    KeyNav.prototype.activate = function () {
        if (!this.mode) {
            this.mode = 'focus';
        }

        return true;
    };

    KeyNav.prototype.nextColumn = function (forward) {
        if (!this.activate()) return;

        var columns = vars.model.layout.columns(),
            columnIndex,
            previous = this[this.mode].element;

        columnIndex = this[this.mode].column;
        if (columnIndex === null && forward === false) {
            columnIndex = columns.length - 1;
        } else if (columnIndex === null && forward === true) {
            columnIndex = 0;
        } else {
            columnIndex += forward === true ? 1 : -1;
        }

        for (var i = columnIndex; i >= 0 && i < columns.length; forward ? i += 1 : i -= 1) {
            console.log('try focus on column', i);
            var next = this.mode === 'select' ? columns[i].focusTarget() : columns[i].focus();
            if (next) {
                console.log('give focus to', i, next);
                this[this.mode].column = i;
                this[this.mode].element = next;
                if (previous) {
                    previous.blur();
                }
                return true;
            }
        }
    };

    KeyNav.prototype.nextElement = function (forward) {
        var active = this[this.mode],
            allColumns = vars.model.layout.columns(),
            previous = active.element,
            next;

        if (!previous && this.mode === 'focus') {
            this.nextColumn(true);
        }
        next = this.mode === 'select' ?
            allColumns[active.column].focusTarget(previous, this.focus.element, forward)
            : allColumns[active.column].focus(previous, forward);

        if (next !== previous && previous) {
            console.log(next, previous);
            previous.blur();
        }
    };

    KeyNav.prototype.selectElement = function () {
        if (!this.activate()) return;

        this.mode = 'select';
        this.select.element = null;
        this.select.column = this.focus.column;
        this.focus.element.select();
        return true;
        // TODO help text
    };

    KeyNav.prototype.cancel = function () {
        this.mode = null;
        if (this.focus.element) {
            this.focus.element.blur();
            this.focus.element.deselect();
        }
        this.focus.element = null;
        this.focus.column = null;
        if (this.select.element) {
            this.select.element.deselect();
        }
        this.select.element = null;
        this.select.column = null;
    };


    // TODO maybe I don'e need these anymore
    KeyNav.prototype.focusFirst = function () {
        _.find(vars.model.layout.columns(), function (column) {
            var element = column.focus();
            if (element) {
                this.active.element = element;
                this.active.column = column;
                this.help(element.keyNav.message());
                return true;
            }
        }, this);
    };

    KeyNav.prototype.focusNext = function (active, forward) {
        var columnFound = false;
        _.find(vars.model.layout.columns(), function (column) {
            if (column === active.column) {
                columnFound = true;
                var next = this.active.element.focus(!event.shiftKey);
                if (next) {
                    return true;
                } else {
                    console.log('giving focus to the next in column');
                    next = column.focus(forward);
                    if (next) {
                        this.active.element = next;
                        this.help(next.keyNav.message());
                    }
                }
            } else if (columnFound) {
                console.log('focus to next column');
                var element = column.focus(forward);
                if (element) {
                    this.active.element = element;
                    this.help(element.keyNav.message());
                }
            }
        }, this);
    };

    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };

    return new KeyNav();
});
