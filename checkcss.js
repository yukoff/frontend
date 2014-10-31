var css = require('css'),
    fs = require('fs'),
    request = require('request'),
    phantom = require('node-phantom');

var urls = [
    'http://www.google.com',
    'http://www.theguardian.com/world/2014/oct/31/britain-eu-contribution-rise-quadruple-cameron'
];

var globalCssPath = 'static/target/stylesheets/global.css',
    headCssPath = 'static/target/stylesheets/head.default.css';

var globalCssStr = fs.readFileSync(globalCssPath, {encoding: 'utf8'});
var globalCss = css.parse(globalCssStr, {source: globalCssPath}),
    rules = globalCss.stylesheet.rules.filter(function(rule) { return rule.type === 'rule'; }),
    selectors = rules
        .map(function(rule) { return rule.selectors; } )
        .reduce(function(a, b) { return a.concat(b); } )
        .map(function(selector) { return selector.replace(':after', '').replace(':before',''); });

console.log('num selectors: ' + selectors.length);

phantom.create(function(err,ph) {
    if (err) {
        console.log('ERROR', err);
        return;
    }
    console.log("created? ", ph.createPage);
    return ph.createPage(function(err,page) {
        console.log("created page? ", page);
        return page.open(urls[0], function(err,status) {
            console.log("opened site? ", status);
            page.evaluate(function() {
                console.log("eval? ");
                var unused = 0;
                require(['qwery'], function(qwery) {
                    selectors.forEach(function(selector) {
                        if (qwery(selector).length === 0) {
                            unused++;
                        }
                    })
                });
            });
            console.log('unused ' + unused);
        });
    });
});