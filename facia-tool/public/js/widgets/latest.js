import LatestArticles from 'models/collections/latest-articles';
import vars from 'modules/vars';
import mediator from 'utils/mediator';
import updateScrollables from 'utils/update-scrollables';

function Latest (params, element) {
    this.column = params.column;

    this.latestArticles = new LatestArticles({
        filterTypes: vars.CONST.filterTypes,
        container: element
    });

    this.latestArticles.search();
    this.latestArticles.startPoller();

    this.subscriptionOnArticles = this.latestArticles.articles.subscribe(updateScrollables);

    mediator.emit('latest:loaded');
}

Latest.prototype.dispose = function () {
    this.subscriptionOnArticles.dispose();
};

export default Latest;
