import _ from 'underscore';
import mockjax from 'test/utils/mockjax';
import mediator from 'utils/mediator';

var lastModified = {};

mockjax({
    url: /\/front\/lastmodified\/(.+)/,
    urlParams: ['front'],
    response: function (req) {
        var response = lastModified[req.urlParams.front];
        if (!response) {
            response = {
                status: 'fail'
            };
        }
        this.responseText = response;
    },
    onAfterComplete: function () {
        mediator.emit('mock:lastmodified');
    }
});

export function set (response) {
    lastModified = _.extend(lastModified, response);
}

