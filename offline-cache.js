// Convenient shortcuts
['log', 'warn', 'error'].forEach(function (method) {
  self[method] = console[method].bind(console);
});

// The root pathname
var root = (function () {
  var currentPath = self.location.pathname;
  var tokens = currentPath.split('/');
  tokens.pop();
  var currentDir = tokens.join('/');
  return currentDir + '/';
}());

// Import plugins
importScripts('offliner-plugins/XMLHttpRequest.js');
importScripts('offliner-plugins/zip.js/zip.js'); // exports zip
importScripts('offliner-plugins/zip.js/zip-ext.js');
importScripts('offliner-plugins/zip.js/deflate.js');
importScripts('offliner-plugins/zip.js/inflate.js');
zip.useWebWorkers = false;


// Import the configuration file.
try {
  importScripts('cache.js');
}
catch (e) {
  var NETWORK_ONLY = {};
  var PREFETCH = null;
  var HOST = null;
}

(function digestConfigFile() {
  var origin = self.location.origin;

  // Convert relative to global URLs.
  Object.keys(NETWORK_ONLY).forEach(function (url) {
    var fallback = NETWORK_ONLY[url];
    url = absoluteURL(url);
    if (typeof fallback === 'string') {
      NETWORK_ONLY[url] = absoluteURL(fallback);
    }
  });

  // Process auto prefetch configuration
  if (PREFETCH === null && HOST === 'gh-pages') {
    PREFETCH = getZipURLFromGHPages(self.location);
  }

  function getZipURLFromGHPages(url) {
    var username = url.host.split('.')[0];
    var repo = url.pathname.split('/')[1];
    return getZipFromGHData(username, repo, 'gh-pages');
  }

  function getZipFromGHData(username, repo, branch) {
    var path = [username, repo, 'zip', branch].join('/');
    return 'https://codeload.github.com/' + path;
  }
}());

function absoluteURL(url) {
  return new self.URL(url, self.location.origin).href;
}

function getMIMEType(filename) {
  var MIMEMap = {
    'css': 'text/css',
    'js': 'application/javascript',
    'html,html': 'text/html'
  };
  var mimetype = 'undefined';
  var extensions = Object.keys(MIMEMap);
  for (var i = 0, exts; (exts = extensions[i]); i++) {
    exts = exts.split(',');
    mimetype = MIMEMap[extensions];
    for (var j = 0, extension; (extension = exts[j]); j++) {
      if (RegExp('\\.' + extension + '$').test(filename)) {
        return mimetype;
      }
    }
  }
  return mimetype;
}


self.addEventListener('install', function (event) {
  log('Offline cache installed at ' + new Date() + '!');
});

self.addEventListener('activate', function (event) {
  event.waitUntil(prefetch().then(function () {
    log('Offline cache activated at ' + new Date() + '!');
  }).catch(error));
});

function prefetch() {
  return cacheNetworkOnly().then(digestPreFetch);
}

function cacheNetworkOnly() {
  return caches.open('my-cache').then(function (offlineCache) {
    Object.keys(NETWORK_ONLY).forEach(function (url) {
      var fallback = NETWORK_ONLY[url];
      if (typeof fallback === 'string') {
        var request = new Request(fallback);
        fetch(request).then(offlineCache.put.bind(offlineCache, request));
      }
    });
  });
}

function digestPreFetch() {
  // is a protocol?
  if (/.+:\/\/.+/.test(PREFETCH)) {
    return populateFromRemoteZip(PREFETCH);
  }
}

function populateFromRemoteZip(zipURL) {
  var readZip = new Promise(function (accept, reject) {
    zip.createReader(new zip.HttpReader(zipURL), function(reader) {
      reader.getEntries(function(entries) {
        deflateInCache(entries)
          .then(reader.close.bind(reader, null)) // avoid callback for close
          .then(accept);
      });
    }, function(error) {
      reject(error);
    });
  });
  return readZip;
}

function deflateInCache(entries) {
  return caches.open('my-cache').then(function (offlineCache) {
    var logProgress = getProgressLogger(entries);
    return Promise.all(entries.map(function deflateFile(entry) {
      var promise;
      if (entry.directory) {
        logProgress();
        promise = Promise.resolve();
      }
      else {
        promise = new Promise(function (accept) {
          entry.getData(new zip.BlobWriter(), function(content) {
            var filename = entry.filename;
            var response = new Response(content, { headers: new Headers({
              'Content-Type': getMIMEType(filename)
            }}));
            var url = absoluteURL(root + filename);
            offlineCache.put(url, response)
              .then(logProgress)
              .then(accept);
          });
        });
      }
      return promise;
    }));
  });

  function getProgressLogger(entries) {
    var total = entries.length;
    var completed = 0;
    return function progressLogger() {
      completed++;
      log('Caching at ' + Math.floor(100 * completed/total) + '%');
    };
  }
}

// Intercept requests to network.
self.addEventListener('fetch', function (event) {
  var request = event.request;
  event.respondWith(offlineResolver(request));
});

// Apply NETWORK_ONLY policy or do the best effort to keep resources always
// up to date.
function offlineResolver(request) {
  if (isNetworkOnly(request)) {
    return responseThroughNetworkOnly(request);
  }
  else {
    return doBestEffort(request);
  }
}

function isNetworkOnly(request) {
  return !!NETWORK_ONLY[request.url];
}

// Try to fetch from network, if no response go to the cache if there is a
// fallback resource or fails.
function responseThroughNetworkOnly(request) {
  return fetch(fetchingURL(request.url)).catch(function () {
    var fallback = NETWORK_ONLY[request.url];
    if (typeof fallback === 'string') {
      return responseThroughCache(new Request(fallback));
    }
  });
}

// Try to fetch from cache or fails.
function responseThroughCache(request) {
  return caches.open('my-cache').then(function (offlineCache) {
    return offlineCache.match(request).catch(function (error) {
      console.log(error);
    });
  });
}

// The best effort consists into try to fetch from remote. If possible, save
// into the cache. If not, retrieve from cache. If not even possible, it fails.
function doBestEffort(request) {
  return caches.open('my-cache').then(function (offlineCache) {
    var localRequest = offlineCache.match(request).catch(function (error) {
      console.log(error);
    });

    var url = fetchingURL(request.url);
    var remoteRequest = fetch(url).then(function (remoteResponse) {
      offlineCache.put(request, remoteResponse.clone());
      return remoteResponse;
    });

    var bestEffort = remoteRequest.catch(function () {
      return localRequest;
    });
    return bestEffort;
  });
}

// Normalizes the url to be fetched.
function fetchingURL(url) {
  // XXX: No idea why we must not bust the root URL, but it works
  var tokens = new self.URL(url);
  return tokens.pathname !== '/' ? busted(tokens) : tokens.href;
}

// Bust the URL to avoid navigator cache.
function busted(tokens) {
  return tokens.href + (tokens.search ? '&' : '?') + '__b=' + Date.now();
}
