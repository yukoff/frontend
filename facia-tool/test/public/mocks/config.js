import _ from 'underscore';
import mediator from 'utils/mediator';
import mockjax from 'test/utils/mockjax';

var mockResponse = {
    fronts: {},
    collections: {}
};

mockjax({
    url: '/config',
    type: 'get',
    response: function () {
        this.responseText = mockResponse;
    },
    onAfterComplete: function () {
        mediator.emit('mock:config');
    }
});

export function set (response) {
    mockResponse = response;
}
export function update (response) {
    _.extend(mockResponse.fronts, response.fronts);
    _.extend(mockResponse.collections, response.collections);
}
