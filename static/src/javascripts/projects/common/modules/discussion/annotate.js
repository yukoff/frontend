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
        $(embed).css({
            position: 'absolute',
            right: '-320px',
            marginTop: '-100px'
        }).prependTo(bodyEl)
    }

    function guardianResolver(url) {
        var matches = url.match(/^(?:http:\/\/www.theguardian.com)?\/(.*\/\d{4}\/[a-z]{3}\/\d{2}\/.*)(\?.*)*(#.*)*/);
        if (matches && matches[1]) {
            var contentId = matches[1];
            console.log('MATCH', contentId);
            return ajax({
                url: 'http://embed.theguardian.com/embed/card/' + contentId + '.json',
                crossOrigin: true
            }).then(function(response) {
                var $flyer = $.create(response.html);
                $flyer.css({width: '300px'});
                console.log($flyer[0]);
                return $flyer[0];
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

    var resolvers = [
        guardianResolver,
        youtubeResolver
    ];

    function annotateLink(bodyEl, link) {
        var $link = $(link),
            href = $link.attr('href');


        _.some(resolvers, function(resolver) {
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

    function annotateEl(el) {
        $(el).removeClass('d-comment__body--not-annotated');
        $('a', el).each(_.curry(annotateLink)(el));
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