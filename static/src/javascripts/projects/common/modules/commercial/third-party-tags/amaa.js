define([
    'common/utils/config'
], function (
    config
) {

    var amaaUrl = '//c.supert.ag/inception-digital/theguardian/supertag-async.js';

    function load() {
        if (config.switches.amaa) {
            return require(['js!' + ammaUrl + '!exports=superT']);
        }
    }

    return {
        load: load
    };

});
