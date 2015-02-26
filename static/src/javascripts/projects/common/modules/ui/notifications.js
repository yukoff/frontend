define([
    'common/utils/$',
    'bean',
    'qwery',
    'common/utils/ajax'
], function (
    $,
    bean,
    qwery,
    ajax
) {

    function Notifications(){
        var that = this;
        this.$count = $('.js-site-notifications__count');
    };

    Notifications.prototype.init = function () {
        bean.on(document.body, 'click', '.js-notfications-toggle', function (e) {
            e.preventDefault();
            document.documentElement.classList.toggle('notifications--open');
        });

        setInterval(function(){
            ajax({
                url: '/inbox/XXX/count'
            }).then(function (resp) {
                that.$count.html(resp.count);
            });
        }, 2000)

    };

    return Notifications;
})
