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
        init: function() {
            $('.content-footer').forEach(function(item) {
                item.empty();
            });
        }
    }
});
