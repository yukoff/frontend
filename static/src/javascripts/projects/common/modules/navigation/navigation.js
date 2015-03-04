define([
    'bean',
    'qwery',
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/mediator'
], function (
    bean,
    qwery,
    fastdom,
    $,
    _,
    mediator
) {
    function Navigation() {}

    Navigation.prototype.init = function () {
        this.enableMegaNavToggle();
        this.replaceAllSectionsLink();
        this.megaNavSrc = null;
    };

    Navigation.prototype.enableMegaNavToggle = function () {
        var that = this;

        bean.on(document, 'click', '.js-navigation-toggle', function (e) {
            e.preventDefault();
            that.toggleMegaNav($(e.currentTarget));
        });
    };

    Navigation.prototype.toggleMegaNav = function ($toggler) {
        var that = this,
            $nav = $('.' + $toggler.attr('data-target-nav'));

        fastdom.write(function () {
            that.regurgitateMegaNavInto($nav);
            $nav.toggleClass('navigation--expanded navigation--collapsed');
        })
    };

    Navigation.prototype.regurgitateMegaNavInto = function ($nav) {
        var that = this;

        if ($nav.attr('data-is-navigationable') === 'true') {
            return;
        }

        fastdom.write(function () {
            $('.js-navigation-placeholder', $nav[0]).html(that.forageForMegaNav());
            $nav.attr('data-is-navigationable', 'true');
            that.announceTheNewNavOnce();
        })
    };

    Navigation.prototype.forageForMegaNav = function () {
        return this.megaNavSrc || (this.megaNavSrc = function () {
            var srcEl = document.getElementById('mega-nav-src');

            if (srcEl) {
                return srcEl[srcEl.nodeName === 'NOSCRIPT' ? 'textContent' : 'innerHTML'];
            };

            return null;
        }());
    };

    Navigation.prototype.announceTheNewNavOnce = _.once(function() {
        mediator.emit('modules:nav:inserted');
    });

    Navigation.prototype.replaceAllSectionsLink = function () {
        $('.js-navigation-toggle').attr('href', '#nav-allsections');
    };

    return Navigation;
});
