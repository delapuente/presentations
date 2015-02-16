(function (asyncStorage) {
  for (var method in this.asyncStorage) {
    var fn = asyncStorage[method];
    asyncStorage[method] = function (fn) {
      var args = Array.prototype.slice.call(arguments);
      return new Promise(function (accept, reject) {
        args[args.length - 1] = accept;
        fn.apply(asyncStorage, args);
      });
    }.bind(this, fn);
  }
  asyncStorage.get = asyncStorage.getItem;
  asyncStorage.set = asyncStorage.setItem;
}(this.asyncStorage));
