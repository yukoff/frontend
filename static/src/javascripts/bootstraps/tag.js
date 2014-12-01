define([
    'common/utils/mediator',
    'common/modules/onward/popular-fronts',
    'common/modules/onward/tag-most-popular'
], function (
    mediator,
    popular,
    tagMostPopular
) {
    var modules = {
            showPopular: function () {
                popular.render();
            }
        },
        ready = function () {
            modules.showPopular();
            tagMostPopular();

            mediator.emit('page:tag:ready');
        };

    return {
        init: ready
    };

});
