import _ from 'underscore';
import mediator from 'utils/mediator';
import mockjax from 'test/utils/mockjax';

var mockResponse = {
    'facia-tool-disable': false,
    'facia-tool-draft-content': true,
    'facia-tool-sparklines': false
};

mockjax({
    url: '/switches',
    response: function () {
        this.responseText = mockResponse;
    },
    onAfterComplete: function () {
        mediator.emit('mock:switches');
    }
});

export function set (response) {
    mockResponse = response;
}
export function override (keys) {
    mockResponse = _.extend(mockResponse, keys);
}
