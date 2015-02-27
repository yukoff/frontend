window.fetch('/lolist').then(function(resp) {
    console.log('fetched lolist')
    resp.json().then(function(json) {
        console.log('got json', json);
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

        setTimeout(make, 1000);
        function make() {
            var lofilist = document.getElementById('lofi-list');
            console.log(lofilist);
            links.forEach(function(link) {
                lofilist.appendChild(link);
            });
        };
    });
});

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
