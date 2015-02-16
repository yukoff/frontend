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
    };

    Navigation.prototype.forageForMegaNav = function () {
        return $('.js-navigation-placeholder', "[data-has-nav]").html() ||
            $('#mega-nav-src')[0].innerText;
    };

    Navigation.prototype.regurgitateMegaNavInto = function ($nav) {
        $('.js-navigation-placeholder', $nav[0]).html(this.forageForMegaNav());
        $nav.attr('data-has-nav', 'true');
        this.announceTheNewNavOnce();
    };

    Navigation.prototype.announceTheNewNavOnce = _.once(function() {
        console.log('emitting')
        mediator.emit('modules:nav:inserted');
    })

    Navigation.prototype.replaceAllSectionsLink = function () {
        $('.js-navigation-toggle').attr('href', '#nav-allsections');
    };

    Navigation.prototype.toggleMegaNav = function ($toggler) {
        var that = this,
            $nav = $('.' + $toggler.attr('data-target-nav'));

        if ($nav.attr('data-has-nav') !== 'true') {
            fastdom.write(function () {
                that.regurgitateMegaNavInto($nav);
            })
        }

        fastdom.write(function () {
            $nav.toggleClass('navigation--expanded navigation--collapsed');
        })
    };

    Navigation.prototype.enableMegaNavToggle = function () {
        var that = this;

        bean.on(document, 'click', '.js-navigation-toggle', function (e) {
            e.preventDefault();
            that.toggleMegaNav($(e.currentTarget));
        });
    };

    return Navigation;
});
