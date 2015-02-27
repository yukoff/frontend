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

    function Notifications() {
        this.$count = $('.js-site-notifications__count');
    }

    Notifications.prototype.init = function () {
        var that = this;
        bean.on(document.body, 'click', '.js-notfications-toggle', function (e) {
            e.preventDefault();
            document.body.scrollTop = 0;
            document.documentElement.classList.toggle('notifications--open');
            $('.js-notfications-toggle')[0].classList.toggle('is-active');
        });

        setInterval(function () {
            ajax({
                url: '/inbox/XXX/count'
            }).then(function (resp) {
                that.$count.html(resp.count.toString());
            });
        }, 2000);

    };

    return Notifications;
});
