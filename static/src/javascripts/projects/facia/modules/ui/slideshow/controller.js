define([
    'Promise',
    'common/modules/experiments/ab',
    'common/utils/$',
    'common/utils/mediator',
    'bonzo',
    'facia/modules/ui/slideshow/state',
    'facia/modules/ui/slideshow/dom'
], function (
    Promise,
    ab,
    $,
    mediator,
    bonzo,
    state,
    dom
) {
    var states = [];

    function waitForLazyLoad(listOfImages) {
        return new Promise(function (resolve) {
            if (listOfImages[0].loaded) {
                resolve(listOfImages);
            } else {
                mediator.on('ui:images:lazyLoaded', function (image) {
                    if (dom.equal(image, listOfImages[0])) {
                        resolve(listOfImages);
                        return true;
                    }
                });
            }
        });
    }

    function startSlideshow(listOfImages) {
        if (listOfImages.length > 1) {
            var stateMachine = state.init(listOfImages);
            states.push(stateMachine);
            stateMachine.goTo(1).then(function () {
                stateMachine.start();
            });
        }
    }

    function actualInit() {
        $('.js-slideshow').each(function (container) {
            return dom.init(container)
                .then(waitForLazyLoad).then(startSlideshow);
        });
    }

    function init(force) {
        // This is called on page load, do as little as possible
        if (force || ab.getTestVariant('FaciaSlideshow') === 'slideshow') {
            setTimeout(actualInit, state.interval);
        }
    }

    function destroy() {
        for (var i = 0, len = states.length; i < len; i += 1) {
            states[i].stop();
        }
    }

    return {
        init: init,
        destroy: destroy
    };
});
