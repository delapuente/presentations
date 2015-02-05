
var root = '/presentations/';

navigator.serviceWorker.register(root + 'offline-cache.js', {
  scope: root
}).then(function () {
  console.log('Offline cache installed at ' + new Date() + '!');
}, function (reason) {
  console.log(reason);
});
