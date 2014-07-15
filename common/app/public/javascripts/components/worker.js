console.log("Worker startup");

this.oninstall = function(event) {

    console.log('Worker install');

    event.waitUntil(
        caches.create('static').then(function() {
            return caches.get('static').then(function(cache) {
                console.log(cache);

                var resourceUrls = [
                    'http://localhost:9000/assets/offline/offline-list.html',
                    'http://localhost:9000/assets/offline/offline.png',
                    'http://localhost:9000/assets/images/global/sprite.png',
                    'http://localhost:9000/assets/stylesheets/head.default.css',
                    'http://localhost:9000/assets/stylesheets/global.css'
                ];

                return Promise.all(resourceUrls.map(function(url) {
                    return cache.add(new Request(url, {mode: 'no-cors'}));
                }));

            });
        }).catch(function(err){
            console.log('Worker install failed');
            console.log(err);
        })
    );
};

this.onactivate = function(event) {
    console.log("Worker activate");
    console.log('worker caches:', caches);
};

this.addEventListener('fetch', function(event) {

    console.log('fetch:', event.request.url);

    //If agent is offline
    if(navigator.connection.type === 'none') {

        //If request matches asset path attempt to get from cache
        if (/\/assets\//.test(event.request.url)) {
            event.respondWith(
                caches.get('static').then(function(cache) {
                    return cache.entriesByMethod.GET[event.request.url];
                }).catch(function () {
                    return event.default();
                })
            );
        }

        event.respondWith(
            caches.get('static').then(function(cache) {
                return cache.entriesByMethod.GET['http://localhost:9000/assets/offline/offline-list.html'];
            }).catch(function(){
                console.log('inside fetch error');
                return event.default();
            })
        );
    }
});