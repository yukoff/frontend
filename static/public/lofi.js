window.addEventListener('online',  online);
window.addEventListener('offline', offline);
//offline();
function online() {
    document.querySelector('html').classList.remove('offline');
}

function offline() {
    document.querySelector('html').classList.add('offline');
    window.fetch('/lolist').then(function(resp) {
        resp.json().then(function(json) {
            var urls = json.urls.map(function(url) {
                var a = url.split('/');
                var headline = capitalizeFirstLetter(a[a.length-1].replace(/-/g, ' '));

                return { headline: headline, url: url };
            });

            var links = urls.map(function(link) {
                var a = document.createElement('a');
                a.href = link.url;
                a.innerHTML = link.headline;

                return a;
            });

            window.addEventListener('DOMContentLoaded', function() {
                console.log('=load');
                var lofilist = document.getElementById('lofi-list');
                links.forEach(function(link) {
                    console.log(link)
                    lofilist.appendChild(link);
                });
            });
        });
    }).catch(function() {});
}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
