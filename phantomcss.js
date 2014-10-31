//var css = require('css')
var fs = require('fs');
//    phantom = require('webpage');
//
var urls = [
    'http://www.google.com',
    'http://www.theguardian.com/world/2014/oct/31/britain-eu-contribution-rise-quadruple-cameron'
];
//
//var globalCssPath = 'static/target/stylesheets/global.css',
//    headCssPath = 'static/target/stylesheets/head.default.css';
//
//var globalCssStr = fs.readFileSync(globalCssPath, {encoding: 'utf8'});
//var globalCss = css.parse(globalCssStr, {source: globalCssPath}),
//    rules = globalCss.stylesheet.rules.filter(function(rule) { return rule.type === 'rule'; }),
//    selectors = rules
//        .map(function(rule) { return rule.selectors; } )
//        .reduce(function(a, b) { return a.concat(b); } )
//        .map(function(selector) { return selector.replace(':after', '').replace(':before',''); });
//
//console.log('num selectors: ' + selectors.length);

var page = require('webpage').create();
var unused = 0;


page.open(urls[0], function(status) {
    console.log("opened site? ", status);

    var title = page.evaluate(function() {
        return document.title;
    });
    console.log('Page title is ' + title);
    page.evaluate(function() {
        window.setTimeout(function() {
            console.log("eval? ");
            require(['qwery'], function(qwery) {
                selectors.forEach(function(selector) {
                    if (qwery(selector).length === 0) {
                        unused++;
                    }
                });
                console.log('unused ' + unused);
            });
        }, 1000);
    });
//    phantom.exit();
});
