window.addEventListener('online',  online);
window.addEventListener('offline', offline);
offline();
function online() {
    document.querySelector('html').classList.remove('offline');
}

function offline() {
    document.querySelector('html').classList.add('offline');
    window.fetch('/lolist').then(function(resp) {
        resp.json().then(function(json) {
            var links = json.urls.map(function(url) {
                var a = url.split('/');
                var headline = capitalizeFirstLetter(a[a.length-1].replace('-', ' '));

                return { headline: headline, url: url };
            });


        });
    }).catch(function() {});
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
