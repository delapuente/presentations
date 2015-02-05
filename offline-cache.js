// Import plugins
importScripts('offliner-plugins/zip.js/zip.js'); // exports zip
zip.workerScriptsPath = getDir() + 'offliner-plugins/zip.js/';

function getDir() {
  var currentPath = self.location.pathname;
  var tokens = currentPath.split('/');
  tokens.pop();
  var currentDir = tokens.join('/');
  return currentDir + '/';
}

// Import the configuration file.
try {
  importScripts('cache.js');
}
catch (e) {
  var NETWORK_ONLY = {};
}

(function digestConfigFile() {
  var origin = self.location.origin;

  // Convert relative to global URLs.
  Object.keys(NETWORK_ONLY).forEach(function (url) {
    var fallback = NETWORK_ONLY[url];
    url = new self.URL(url, origin).href;
    if (typeof fallback === 'string') {
      NETWORK_ONLY[url] = new self.URL(fallback, origin).href;
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
    var path = [username, repo, 'archive', branch + '.zip'].join('/');
    return 'https://github.com/' + path;
  }

  console.log('PREFETCH:', PREFETCH);
}());

self.addEventListener('install', function (event) {
  console.log('Offline cache installed at ' + new Date() + '!');
});

self.addEventListener('activate', function (event) {
  console.log('Offline cache activated at ' + new Date() + '!');
  event.waitUntil(prefetch());
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
  if (/\.zip$/.test(PREFETCH)) {
    return populateFromRemoteZip(PREFETCH);
  }
}

function populateFromRemoteZip(zipURL) {
  var readZip = new Promise(function (accept, reject) {
    zip.createReader(new zip.HttpReader(zipURL), function(reader) {
      reader.getEntries(function(entries) {
        console.log(entries);
        accept(entries);
      });
    }, function(error) {
      reject(error);
    });
  });
  return readZip;
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
