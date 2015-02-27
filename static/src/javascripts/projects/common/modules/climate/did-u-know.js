define([
    'bean',
    'qwery',
    'common/utils/_',
    'common/utils/$'
], function (
    bean,
    qwery,
    _,
    $
    ) {

    var list = [
        {
            title: "Missed the tube? Walk!",
            tip: "It emits no pollution and is totally carbon free."
        },
        {
            title: "Fine tune your computer settings",
            tip: "65 per cent of energy used by computers is spent on running idle."
        },
        {
            title: "Save water, save electricity",
            tip: "Over 30 million litres of water are boiled in the UK every day only to go cold again."
        },
        {
            title: "Eat seasonably and locally",
            tip: "Slim down your carbon footprint and stop eating things that need to travel across the world. Like tomatoes in winter."
        },
        {
            title: "Your impact on climate change",
            tip: "You can set yourself your own carbon savings goal and then strive to achieve it."
        }
    ];

    return {
        init: function () {
            var item = list[Math.floor(Math.random() * list.length)];

            $('.js-components-container').append('<div class="diduknow u-h">' +
                '<p class="diduknow__title">' + item.title + '</p>' +
                '<p class="diduknow__txt">' + item.tip + '</p>' +
                '<a class="diduknow__link" href="" title="">Climate change is here. Learn more.</a>' +
                '</div>');
            $('.diduknow').css('top', (Math.random() * 2000) + 900 + 'px').toggleClass('u-h')

        }
    }
});
