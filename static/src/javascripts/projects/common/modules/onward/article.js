define([
    'bonzo',
    'qwery',
    'lodash/arrays/union',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/proximity-loader',
    'common/modules/analytics/register',
    'common/modules/commercial/badges',
    'common/modules/component'
], function (
    bonzo,
    qwery,
    union,
    $,
    config,
    mediator,
    proximityLoader,
    register,
    badges,
    Component
) {

    function Article(context, remaining) {
        //register.begin('series-content');
        this.context = context;
        this.remaining = remaining - 1;
        //this.endpoint = '/series/' + getTag() + '.json?shortUrl=' + encodeURIComponent(config.page.shortUrl);
        //this.endpoint = 'http://localhost:9000/commentisfree/2015/feb/26/turn-out-young-voters-get-david-cameron-out.json';

        this.endpoint = bonzo(context).attr('data-related-link');
        this.fetch(this.context, 'html');
    }

    Component.define(Article);

    Article.prototype.ready = function (container) {
        var placeholder = qwery('.js-next-article-placeholder', container);

        $('.content-footer').empty();
        console.log("about to check:", this.remaining);
        if (placeholder && this.remaining > 0) {
            proximityLoader.add(placeholder, 1500, insertNextArticle(placeholder, this.remaining));
        }

        //badges.add(container);
        //register.end('series-content');
        //mediator.emit('modules:onward:loaded');
        //mediator.emit('ui:images:upgradePicture', this.context);
    };

    function insertNextArticle(placeholder, remaining) {
        console.log("remaining is:", remaining);
        return function () {
            console.log("remaining is still:", remaining);
            new Article(placeholder, remaining);
        };
    }

    return function () {
        var placeholder = qwery('.js-next-article-placeholder');
        if (placeholder) {
            proximityLoader.add(placeholder, 1500, insertNextArticle(placeholder, 2));
        }

    };

});
