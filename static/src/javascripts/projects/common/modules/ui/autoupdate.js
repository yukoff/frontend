/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'bean',
    'bonzo',
    'lodash/collections/toArray',
    'lodash/objects/assign',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/twitter',
    'common/modules/live/notification-bar',
    'common/utils/template',
    'text!common/views/ui/autoupdate.html'
], function (
    bean,
    bonzo,
    toArray,
    assign,
    $,
    ajax,
    config,
    detect,
    mediator,
    twitter,
    NotificationBar,
    template,
    autoupdateTemplate
) {
    /*
        @param {Object} options hash of configuration options:
            path             : {String}              Endpoint path to ajax request,
            delay            : {Number}              Timeout in milliseconds to query endpoint,
            attachTo         : {DOMElement|Object}   DOMElement or list of elements insert response into
            switches         : {Object}              Global switches object
            manipulationType : {String}              Which manipulation method used to insert content into DOM
    */
    function Autoupdate(opts) {

        var options = assign({
            'activeClass':      'is-active',
            'btnClass':         '.js-auto-update',
            'manipulationType': 'html',
            'backoff':          1, // 1 = no backoff
            'backoffMax':       1000 * 60 * 20 // 20 mins
        }, opts);

        this.unreadBlocks = 0;
        this.notification = '<';
        this.updateDelay = options.delay;

        this.view = {
            render: function (res) {
                var attachTo = options.attachTo,
                    manipulation = this.getManipulationType(),
                    date = new Date().toString(),
                    $attachTo = bonzo(attachTo),
                    resultHtml = $.create('<div>' + res.html + '</div>')[0],
                    elementsToAdd = resultHtml.innerHTML;

                this.unreadBlocks += resultHtml.children.length;

                if (manipulation === 'prepend') {
                    bonzo(resultHtml.children).addClass('autoupdate--hidden');
                    elementsToAdd = toArray(resultHtml.children);
                } else if (manipulation === 'append') {
                    bonzo(resultHtml.children).addClass('autoupdate--hidden');
                    elementsToAdd = toArray(resultHtml.children).reverse();
                }

                $attachTo[manipulation](elementsToAdd);

                if (elementsToAdd.length) {
                    mediator.emit('modules:autoupdate:updates', elementsToAdd);
                }
                // add a timestamp to the attacher
                $attachTo.attr('data-last-updated', date);
                twitter.enhanceTweets();

                if (this.isUpdating && detect.pageVisible()) {
                    this.notificationBar.setState('hidden');
                    this.view.revealNewElements.call(this);
                } else if (this.unreadBlocks > 0) {
                    this.notificationBar.notify(this.unreadBlocks);
                    mediator.emit('modules:autoupdate:unread', this.unreadBlocks);
                }
            },

            toggle: function (btn) {
                var action = btn.getAttribute('data-action');
                $('.js-update').empty().html(this.getTemplate(action));
                this[action]();
            },

            destroy: function () {
                $('.js-update').remove();
                mediator.emit('modules:autoupdate:destroyed');
            },

            revealNewElements: function () {
                var $newElements = $('.autoupdate--hidden', options.attachTo);
                $newElements.addClass('autoupdate--highlight').removeClass('autoupdate--hidden');

                // Do not reset the unread count when page isn't visible. The notification count will then show the
                // number of blocks loaded since the last reader view.
                if (detect.pageVisible()) {
                    this.unreadBlocks = 0;
                }
                mediator.emit('modules:autoupdate:unread', this.unreadBlocks);

                setTimeout(function () {
                    $newElements.removeClass('autoupdate--highlight');
                }, 5000);
            }
        };

        this.load = function () {
            var that = this,
                path = (typeof options.path === 'function') ? options.path() : options.path + '.json';

            return ajax({
                url: path,
                type: 'json',
                crossOrigin: true
            }).then(
                function (response) {
                    if (response.refreshStatus === false) {
                        that.off();
                        that.view.destroy();
                    } else {
                        that.view.render.call(that, response);
                        mediator.emit('modules:autoupdate:loaded', response);
                    }
                }
            );
        };

        this.on = function () {
            this.isUpdating = true;

            if (this.timeout) { window.clearTimeout(this.timeout); }

            var updateLoop = function () {
                this.load();
                var newDelay = detect.pageVisible() ? options.delay : this.updateDelay * options.backoff;
                this.updateDelay = Math.min(newDelay, options.backoffMax);
                this.timeout = window.setTimeout(updateLoop, this.updateDelay);
            }.bind(this);

            updateLoop();
        };

        this.off = function () {
            this.isUpdating = false;
        };

        this.init = function () {
            if (config.switches && config.switches.autoRefresh !== true) {
                return;
            }

            this.notificationBar = new NotificationBar({attachTo: $('.js-update-notification')[0] });

            $(options.attachTo).addClass('autoupdate--has-animation');

            detect.initPageVisibility();

            mediator.on('modules:detect:pagevisibility:visible', function () {
                if (this.isUpdating) {
                    this.on(); // reset backoff
                    that.view.revealNewElements();
                }
            }.bind(this));

            mediator.on('modules:notificationbar:show', this.view.revealNewElements.bind(this));

            // add the component to the page, and show it
            $('.js-update').html(this.getTemplate('on'));

            bean.add(document.body, 'click', options.btnClass, function (e) {
                e.preventDefault();
                this.view.toggle(e.target);
            }.bind(this));
        };

        this.getTemplate = function (state) {
            return bonzo.create(template(alertHtml, {
                stateText: state,
                state: state.charAt(0) + state.slice(1),
                stateNext: (state === 'on') ? 'off' : 'on'
            }));
        };

        this.setManipulationType = function (manipulation) {
            options.manipulationType = manipulation;
        };

        this.getManipulationType = function () {
            return options.manipulationType;
        };
    }

    return Autoupdate;

});
