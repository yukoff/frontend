window.fetch('/lolist').then(function(resp) {
    resp.json().then(function(json) {
        var urls = json.urls.map(function(url) {
            var a = url.split('/');
            var headline = capitalizeFirstLetter(a[a.length-1].replace(/-/g, ' '));

            return { headline: headline, url: url };
        });

        var links = urls.map(function(link) {
            var li = document.createElement('li');
            var a = document.createElement('a');
            a.href = link.url;
            a.innerHTML = link.headline;


            a.onclick = function(e) {
                window.fetch(a.href).then(function(resp) {
                    resp.text().then(function(text) {
                        var d = document.createElement('div');
                        d.innerHTML = text;

                        li.appendChild(d);
                    });
                });

                return false;
            };

            li.appendChild(a);
            return li;
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

function pollThings() {
    window.fetch('/inbox/rob_test_3').then(function(resp) {
        resp.json().then(function(json) {
            json.messages.forEach(function(m) {
                var u = m.message.url;
                if(!u) { return; }
                window.fetch('/lofi'+ u);
            });
        });
    });
}

setInterval(pollThings, 1000);
