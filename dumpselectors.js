var css = require('css'),
    fs = require('fs'),
    _ = require('lodash');

var globalCssPath = 'static/target/stylesheets/global.css',
    headCssPath = 'static/target/stylesheets/head.default.css';

var globalCssStr = fs.readFileSync(globalCssPath, {encoding: 'utf8'});
var globalCss = css.parse(globalCssStr, {source: globalCssPath}),
    rules = globalCss.stylesheet.rules.filter(function(rule) { return rule.type === 'rule'; }),
    selectors = _(rules)
        .map(function(rule) { return rule.selectors; } )
        .flatten()
//        .map(function(selector) { return selector.split(','); })
        .map(function(selector) { return selector.replace(':after', '').replace(':before',''); })
        .valueOf();

console.log('num selectors: ' + selectors.length);

fs.writeFileSync('selectors.txt', selectors.toString());

