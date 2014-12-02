define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/modules/ui/tabs'
], function (
    $,
    ajax,
    config,
    Tabs
) {
    function injectContainer(tagId) {
        ajax({
            url: '/most-popular-in-tag/' + tagId + '.json',
            method: 'get',
            type: 'json',
            success: function (data) {
                var $mostPopularInTag = $('.js-most-popular-in-tag');

                if (data && $mostPopularInTag) {
                    $mostPopularInTag.html(data.body);
                    new Tabs().init($mostPopularInTag[0]);
                }
            }
        });
    }

    return function () {
        if (config.page.contentType === 'Tag') {
            injectContainer(config.page.pageId);
        }
    };
});
