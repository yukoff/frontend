define([
    'qwery',
    'common/utils/_',
    'common/utils/$'
], function (
    qwery,
    _,
    $
    ) {

    return {
        init: function () {
            $('.content-footer').empty();
            $('.l-footer').empty();
            $('#header').detach().appendTo('.l-footer');
        }
    };
});
