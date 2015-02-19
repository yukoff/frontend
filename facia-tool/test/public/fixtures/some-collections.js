import { set as mockCollection } from 'mock/collection';
import dates from 'test/fixtures/dates';

mockCollection({
    latest: {
        lastUpdated: dates.yesterday.toISOString(),
        live: [{
            id: 'internal-code/content/1',
            frontPublicationDate: dates.yesterday.getTime()
        }],
        updatedBy: 'Test'
    },
    sport: {
        lastUpdated: dates.justNow.toISOString(),
        live: [],
        updatedBy: 'You'
    }
});
