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
            var lofilist = document.getElementById('lofi-list');
            links.forEach(function(link) {
                lofilist.appendChild(link);
            });
        });
    });
}).catch(function() {});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

window.fetch('/inbox/rob_test_3').then(function(resp) {
    resp.json().then(function(json) {
        json.messages.forEach(function(m) {
            var u = m.message.url;
            if(!u) { return; }
            window.fetch('/lofi'+ u);
        });
    });
});
