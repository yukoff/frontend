/* globals _ */
define([
    'knockout',
    'models/collections/latest-articles',
    'models/group',
    'modules/vars',
    'utils/mediator',
    'utils/update-scrollables'
], function (
    ko,
    LatestArticles,
    Group,
    vars,
    mediator,
    updateScrollables
) {
    var updateClipboardScrollable = function (what) {
        var onClipboard = true;
        if (what && what.targetGroup) {
            onClipboard = what.targetGroup.parentType === 'Clipboard';
        }
        if (onClipboard) {
            _.defer(updateScrollables);
        }
    };

    mediator.on('collection:updates', updateClipboardScrollable);
    mediator.on('ui:close', updateClipboardScrollable);
    mediator.on('ui:omit', updateClipboardScrollable);
    mediator.on('ui:resize', updateClipboardScrollable);

    function Latest (params, element) {
        params.column.registerWidget(this);
        this.uiOpenElement = ko.observable();
        this.latestArticles = new LatestArticles({
            filterTypes: vars.CONST.filterTypes,
            container: element
        });
        this.clipboard = new Group({
            parentType: 'Clipboard',
            keepCopy:  true,
            front: null,
            elementHasFocus: this.elementHasFocus.bind(this)
        });
        this.currentFocus = null;
        this.currentActive = null;
        // TODO clipboard can be a drag target
        this.currentTarget = null;

        this.latestArticles.search();
        //this.latestArticles.startPoller();


        var model = this;
        this.onUIOpen = function(element, article, front) {
            if (!front) {
                model.uiOpenElement(element);
            }
            updateClipboardScrollable(article ? {
                targetGroup: article.group
            } : null);
        };
        mediator.on('ui:open', this.onUIOpen);

        this.subscriptionOnArticles = this.latestArticles.articles.subscribe(updateScrollables);

        mediator.emit('latest:loaded');
    }

    Latest.prototype.elementHasFocus = function (meta) {
        return meta === this.uiOpenElement();
    };

    Latest.prototype.dispose = function () {
        mediator.off('ui:open', this.onUIOpen);
        this.subscriptionOnArticles.dispose();
    };

    Latest.prototype.focus = function (direction) {
        var articles = this.latestArticles.articles();
        if (!articles.length) {
            return;
        }

        var focusPosition, focused = _.find(articles, function (article, position) {
            if (article.state.focus()){
                focusPosition = position;
                return true;
            }
        });

        var next = NaN;
        if (focused) {
            if (direction === true) {
                next = focusPosition + 1;
            } else if (direction === false) {
                next = focusPosition - 1;
            } else {
                next = 0;
            }
        } else {
            next = 0;
        }

        if (articles[next]) {
            if(focused) {
                focused.state.focus(false);
            }
            articles[next].state.focus(true);
            articles[next].dom.scrollIntoView(false);
            this.currentFocus = articles[next];
            return true;
        }
    };

    Latest.prototype.select = function () {
        var articles = this.latestArticles.articles();
        var focused = _.find(articles, function (article, position) {
            return article.state.focus();
        });
        focused.state.selected(true);
        focused.state.focus(false);
        this.currentActive = focused;
        return this;
    };

    Latest.prototype.blur = function () {
        if (this.currentFocus) {
            this.currentFocus.state.focus(false);
            this.currentFocus = null;
        }
    };

    Latest.prototype.deselect = function () {
        if (this.currentActive) {
            this.currentActive.state.selected(false);
            this.currentActive = null;
        }
    };

    Latest.prototype.keyNav = {
        selected: false,
        keydown: {
            enter: function () {
                console.log('pressing enter');
            }
        },
        message: function () {
            if (this.selected) {
                return 'Press <strong>left/right</strong> arrow to select target and <strong>enter</strong> to drop.';
            } else {
                return 'Press <strong>enter</strong> to select and start dragging.';
            }
        }
    };

    return {
        createViewModel: function (params, componentInfo) {
            return new Latest(params, componentInfo.element);
        }
    };
});
