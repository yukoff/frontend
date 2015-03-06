define([
    'lodash/collections/find',
    'lodash/functions/once',
    'lodash/objects/has',
    'common/utils/mediator'
], function (
    find,
    once,
    has,
    mediator
) {
    var events = {
        1:  'pageLoadComplete',
        2:  'slotCreate',
        3:  'slotFetch',
        4:  'slotReceiving',
        5:  'slotRendering',
        6:  'slotRendered',
        8:  'googleJsLoaded',
        17: 'slotAddTargeting',
        31: 'queueStart',
        35: 'serviceCreate',
        40: 'serviceAddSlot',
        46: 'gptFetch',
        48: 'gptFetched',
        50: 'slotFill',
        53: 'slotRenderDelay',
        63: 'serviceSingleRequestModeEnable',
        78: 'serviceCollapseContainersEnable',
        88: 'serviceAddTargeting'
    };

    function getSlotName(slot) {
        var obj = find(slot, function (x) {
            return has(x, 'slot') && x.slot.length;
        });

        return obj && obj.slot[0];
    }

    return {
        init: once(function() {
            window.googletag.cmd.push(function () {
                googletag.debug_log.log = function (level, message, service, slot) {
                    var id = message.getMessageId(),
                        slotName = getSlotName(slot);

                    if (id && slot) {
                        mediator.emit('modules:commercial:dfp:events:' + events[id], {
                            slot: slotName,
                            campaignId: null
                        });
                    }
                };
            });
        })
    };
});
