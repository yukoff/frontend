self.addEventListener('install', function(event) {
  console.log("lofi installed");
});

self.addEventListener('activate', function(event) {
  console.log("lofi activated");
});

var cn = { lofi: 'lofi' };

self.addEventListener('fetch', function(event) {
    var req = event.request;
    var u = new URL(req.url);

    // we're and article
    if (/\d+\/\w{3}\/\d+/.test(u.pathname) && !(/^\/lofi/.test(u.pathname)) && !u.pathname.match('embed') && !u.pathname.match('theguardian')) {
        console.log('trying to cache '+ u.pathname);
        fetch('/lofi'+ u.pathname).then(function(resp) {
            if (resp.ok) {
                console.log('fetched lofi version of '+ u.pathname);
                console.log('caching lofi version of '+ u.pathname);
                lofiResp(resp);
            }
        });
    }

    // we're a lofi article
    if (/^\/lofi\//.test(u.pathname)) {
        console.log('respondWith lofi request');
        event.respondWith(lofiResp(req));
    }
});

function lofiResp(req) {
    return caches.match(req.url).then(function(response) {
        if (response) {
            console.log('returning cached resp' + response);
            return response;
        }

        return fetch(req.url).then(function(resp) {
            caches.open(cn.lofi).then(function(cache) {
                cache.put(req.url, resp).then(function() {
                    console.log('lofi cached');
                }, function() {
                    console.log('lofi no cache');
                });
            });
        });
    });
}
