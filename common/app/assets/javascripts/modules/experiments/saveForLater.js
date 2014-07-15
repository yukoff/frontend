define([
    'bean',
    'qwery',
    'bonzo',
    'common/utils/ajax',
    'common/utils/storage'
], function(bean, qwery, bonzo, ajax, storage){


    return {
        init: function() {
            var btn = qwery('.save-for-later__action')[0],
                savedItems;

            //Setup storage array
            if(!storage.local.get('gu.saved')) {
                storage.local.set('gu.saved', []);
            }

            savedItems = storage.local.get('gu.saved');

            //Bind to save button
            bean.on(btn, 'click', function(e) {
                e.preventDefault();

                bonzo(qwery('.save-for-later')).addClass('save-for-later--status-saved');

                ajax({
                    url: window.location.pathname + '.json',
                    type: 'json',
                    crossOrigin: true
                }).then(function(resp){
                    savedItems.push(resp);
                    storage.local.set('gu.saved', savedItems);
                });
            });
        }
    };

});