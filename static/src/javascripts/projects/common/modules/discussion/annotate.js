define([
    'bean',
    'bonzo',
    'qwery',

    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
], function (
    bean,
    bonzo,
    qwery,

    $,
    _,
    ajax
) {
    var $discussionEl = [],
        proceed = false,
        windowSpread = 200;

    function addEmbed(bodyEl, embed) {
        console.log('addEmbed', bodyEl, embed);
        $.create('<aside class="comment-annotation"></aside>')
            .append(embed)
            .prependTo(bodyEl);
    }

    function guardianResolver(url) {
        var matches = url.match(/^(?:http:\/\/www.theguardian.com)?\/(.*\/\d{4}\/[a-z]{3}\/\d{2}\/.*)(\?.*)*(#.*)*/);
        if (matches && matches[1]) {
            var contentId = matches[1];
            console.log('GU CONTENT', contentId);
            return ajax({
                url: 'http://embed.theguardian.com/embed/card/' + contentId + '.json',
                crossOrigin: true
            }).then(function(response) {
                return response.html;
            });
        }
        return false;
    }

    function youtubeResolver(url) {
        var matches = url.match(/^https?:\/\/www.youtube.com\/watch\?v=([a-zA-Z0-9_-]*)/);
        if (matches && matches[1]){
            console.log('YOUTUBE', matches[1]);
            var videoId = matches[1];
            return '<iframe width="300" height="225" src="//www.youtube.com/embed/' +
                    videoId + '" frameborder="0" allowfullscreen></iframe>';
        }
        return false;
    }

    function embedlyResolver(url) {
        var embedlyables = {
            'wiki': /https?:\/\/.*\.wikipedia\.org\/wiki\/.*/
        };
        var match = _(embedlyables).pairs().find(function(embedlyable) { return url.match(embedlyable[1]); });
        if (match) {
            return ajax({
                url: 'http://api.embed.ly/1/oembed?url=' + encodeURIComponent(url) + '&maxwidth=300',
                crossOrigin: true,
                type: 'json'
            }).then(function(response) {
                var $wiki = $.create(response.html).css({
                    padding: '5px',
                    border: '1px solid #dfdfdf'
                });
                $.create('<img src="http://www.kachingle.com/assets/sites/2/2842-wikipedia-logo-kx.jpg">')
                    .css({
                        width: '34px',
                        float: 'left',
                        padding: '2px 5px'
                    })
                    .prependTo($wiki[0]);
                return $.create('<aside class="comment-annotation__' + match[0] +'"></aside>')
                    .append($wiki[0])[0];
            });
        }
    }

    var resolvers = [
        guardianResolver,
        youtubeResolver,
        embedlyResolver
    ];

    function annotateLink(bodyEl, link) {
        var $link = $(link),
            href = $link.attr('href');

        if (href) {
            return _.some(resolvers, function(resolver) {
                var resolved = resolver(href);
                if (!resolved) { return false; }
                if (typeof resolved.then === 'function') {
                    resolved.then(_.curry(addEmbed)(bodyEl))
                } else if (typeof resolved === 'string') {
                    console.log('STRING', resolved);
                    addEmbed(bodyEl, bonzo.create(resolved)[0]);
                }
                return true;
            });
        }
    }

    function annotateEl(el) {
        $(el).removeClass('d-comment__body--not-annotated');
        _.some(qwery('a', el), _.curry(annotateLink)(el));
    }

    function isElInWindow(windowTop, windowBottom, el) {
        var elTop = $(el).offset().top;
        return windowTop < elTop && elTop < windowBottom;
    }

    function onScroll() {
        $discussionEl = $discussionEl.length ? $discussionEl : $('.discussion');
        if ($discussionEl.length > 0) {
            proceed = proceed || !$discussionEl.hasClass('discussion--truncated');
            if (proceed) {
                var scrollTop = $(window).scrollTop(),
                    scrollTopWindow = scrollTop - windowSpread,
                    scrollBottomWindow = scrollTop + window.innerHeight + windowSpread;
                _(qwery('.d-comment__body--not-annotated'))
                    .filter(_.curry(isElInWindow)(scrollTopWindow,scrollBottomWindow))
                    .forEach(annotateEl);
            }
        }
    }

    function init() {
        bean.on(window, 'scroll', _.throttle(onScroll, 50))
    }

    return {
        init: init
    };
});