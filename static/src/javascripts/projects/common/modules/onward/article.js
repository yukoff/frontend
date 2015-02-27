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

    function Article(context) {
        //register.begin('series-content');
        this.context = context;
        //this.endpoint = '/series/' + getTag() + '.json?shortUrl=' + encodeURIComponent(config.page.shortUrl);
        //this.endpoint = 'http://localhost:9000/commentisfree/2015/feb/26/turn-out-young-voters-get-david-cameron-out.json';
        console.log('link', bonzo(context).attr('data-related-link'));
        this.endpoint = bonzo(context).attr('data-related-link');
        this.fetch(this.context, 'html');
    }

    Component.define(Article);

    Article.prototype.ready = function (container, remaining) {
        console.log('WOO', container);

        var placeholder = qwery('.js-next-article-placeholder', container);
        console.log('another is', placeholder);
        $('.content-footer').empty();
        if (placeholder && remaining > 0) {
            proximityLoader.add(placeholder, 1500, insertNextArticle(placeholder, --remaining));
        }

        //badges.add(container);
        //register.end('series-content');
        //mediator.emit('modules:onward:loaded');
        //mediator.emit('ui:images:upgradePicture', this.context);
    };

    Article.prototype.error = function (xhr) {
        //register.error('series-content');
        console.log('EEEEK', xhr);
    };

    function insertNextArticle(placeholder, remaining) {
        return function () {
            remaining = remaining || 3;
            console.log('curried in', placeholder);
            new Article(placeholder, remaining);
        }
    }

    return function () {

        var placeholder = qwery('.js-next-article-placeholder');
        if (placeholder) {
            proximityLoader.add(placeholder, 1500, insertNextArticle(placeholder));
        }

    };

});
