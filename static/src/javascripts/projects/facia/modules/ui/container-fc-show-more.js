define([
    'common/utils/$',
    'bonzo',
    'bean',
    'qwery'
], function (
    $,
    bonzo,
    bean,
    qwery
) {
    return function (container) {
        var $container = bonzo(container),
            itemsHiddenOnDesktop = qwery('.js-hide', $container).length > 0,
            itemsHiddenOnMobile = qwery('.js-hide-on-mobile', $container).length > 0,
            className = 'fc-show-more--hidden',
            $button = $.create(
                '<button class="collection__show-more button button--large" data-test-id="show-more" data-link-name="Show more | 1">' +
                '<span class="i i-plus-neutral1"></span>' +
                'Show more' +
                '</button>'
            );

        function showMore() {
            /**
             * Do not remove: it should retain context for the click stream module, which recurses upwards through
             * DOM nodes.
             */
            $button.hide();
            $container.removeClass(className);
        }

        if (itemsHiddenOnMobile || itemsHiddenOnDesktop) {
            if (!itemsHiddenOnDesktop) {
                $container.addClass('fc-show-more--mobile-only');
            }

            $container.addClass(className)
                .append($button)
                .removeClass('js-container--fc-show-more');
            bean.on($button[0], 'click', showMore);
        }
    };
});
