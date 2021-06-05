const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
    "./js/idb.js",
];

// cache resources
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

// delete outdated caches
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function (keylist) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create keeplist
            let cacheKeeplist = keylist.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            // add current cache name to keeplist
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keylist.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keylist[i]);
                    return caches.delete(keylist[i]);
                }
            }));
        })
    );
});

// respond with cached resources
self.addEventListener('fetch', function(e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function(request) {
            // if cache is available respond with cache
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                // if there is no cache, try fetch request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})