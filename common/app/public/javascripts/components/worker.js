console.log("Worker startup");

this.oninstall = function(event) {
    console.log("Install", event);
};

this.onactivate = function(event) {
    console.log("Activate");
};

this.addEventListener('fetch', function(event) {
    console.log(event);
    event.respondWith(new Response(new Blob(["I have hijacked your page!"], {type : 'text/html'})));
});