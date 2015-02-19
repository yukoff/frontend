import $ from 'jquery';
import vars from 'modules/vars';
import urlAbsPath from 'utils/url-abs-path';
import findFirstById from 'utils/find-first-by-id';

export function newItemsConstructor (id) {
    return [findFirstById(vars.model.collections, urlAbsPath(id))];
}

export function newItemsValidator (newItems) {
    var defer = $.Deferred();

    defer[newItems[0]? 'resolve' : 'reject']();

    return defer.promise();
}

export function newItemsPersister (newItems, sourceContext, sourceGroup, targetContext, targetGroup) {
    if (newItems[0].parents.indexOf(targetGroup.parent) < 0) {
        newItems[0].parents.push(targetGroup.parent);
    }

    targetGroup.parent.saveProps();
}

