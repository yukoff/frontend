define([
    'bonzo',
    'qwery',
    'lodash/arrays/union',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/proximity-loader',
    'common/utils/template',
    'common/modules/analytics/register',
    'common/modules/commercial/badges',
    'common/modules/component',
    'text!common/views/homepage.html'
], function (
    bonzo,
    qwery,
    union,
    $,
    config,
    mediator,
    proximityLoader,
    template,
    register,
    badges,
    Component,
    homepageTmpl
) {

    function Article(context, remaining) {
        //register.begin('series-content');
        this.context = context;
        this.remaining = remaining - 1;
        //this.endpoint = '/series/' + getTag() + '.json?shortUrl=' + encodeURIComponent(config.page.shortUrl);
        //this.endpoint = 'http://localhost:9000/commentisfree/2015/feb/26/turn-out-young-voters-get-david-cameron-out.json';

        this.endpoint = bonzo(context).attr('data-related-link');
        this.fetch(this.context, 'html');
        this.contentFooter = null;
    }

    Component.define(Article);

    Article.prototype.ready = function (container) {
        var placeholder = qwery('.js-next-article-placeholder', container),
            el;

        $('.content-footer').empty();
        if (placeholder && this.remaining > 0) {
            proximityLoader.add(placeholder, 1500, insertNextArticle(placeholder, this.remaining));
        } else {
            el = bonzo.create(template(homepageTmpl));
            $('.l-footer').append(el);
            $('.l-footer').css({'background-color': 'white'});
        }

        //badges.add(container);
        //register.end('series-content');
        //mediator.emit('modules:onward:loaded');
        //mediator.emit('ui:images:upgradePicture', this.context);
    };

    function insertNextArticle(placeholder, remaining) {
        return function () {
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
