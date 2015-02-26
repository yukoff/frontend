self.addEventListener('push', function(e) {
    console.log(self);

    if (!(self.Notification && self.Notification.permission === 'granted')) {
            console.error('Failed to display notification - not supported');
        return;
    }

    fetch('/inbox/rob_test').then(function(rawData){
        rawData.json().then(function(data){
            console.log(data);
            var msg = data.messages[0].message;
            return registration.showNotification(msg.title, {
                body: msg.body,
                icon: msg.image,
                tag: msg.url,
                data: {
                    url: msg.url
                }
            });
        });
    });

});

self.addEventListener('notificationclick', function(e) {
      console.log('On notification click: ', e);

      if (e.notification.tag) {
          clients.openWindow(e.notification.tag);
      }

});
