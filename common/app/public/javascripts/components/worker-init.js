navigator.serviceWorker.register(guardian.workerUrl, {
    scope: '/*'
}).then(function(sw) {
    console.log("Registered!", sw);
}).catch(function(err) {
    console.log("Reg failed", err);
});