define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config'
], function (
    $,
    ajax,
    config
) {
    function injectContainer(tagId) {
        ajax({
            url: '/most-popular-in-tag/' + tagId + '.json',
            method: 'get',
            type: 'json',
            success: function (data) {
                if (data) {
                    $('.js-most-popular-in-tag').html(data.body);
                }
            }
        });
    }

    return function () {
        console.log(config.contentType, config.pageId);
        if (config.page.contentType === 'Tag') {
            injectContainer(config.page.pageId);
        }
    };
});
