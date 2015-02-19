import { set as mockLastModified } from 'mock/lastmodified';
import lastModified from 'utils/fetch-lastmodified';

describe('Last Modified', function () {
    it('fetches the last time', function (done) {
        var now = new Date();

        mockLastModified({
            'this/front': now.toISOString()
        });
        lastModified('this/front').then(function (result) {
            expect(result).toEqual({
                date: now,
                human: 'just now',
                stale: false
            });

            done();
        });
    });

    it('fetches a stale date', function (done) {
        var past = new Date();
        past.setFullYear(past.getFullYear() - 1);

        mockLastModified({
            'this/front': past.toISOString()
        });
        lastModified('this/front').then(function (result) {
            expect(result).toEqual({
                date: past,
                human: '1 year ago',
                stale: true
            });

            done();
        });
    });
});
