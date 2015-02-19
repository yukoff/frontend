import _ from 'underscore';
import mediator from 'utils/mediator';
import mockjax from 'test/utils/mockjax';

var stories = {};

mockjax({
    url: /\/stories-visible\/(.+)/,
    urlParams: ['collection'],
    response: function (req) {
        var response = stories[req.urlParams.collection];
        if (!response) {
            response = {
                status: 'fail'
            };
        }
        this.responseText = response;
    },
    onAfterComplete: function () {
        mediator.emit('mock:stories-visible');
    }
});

export function set (response) {
    stories = _.extend(stories, response);
}
