﻿var CACHE_VERSION = "10";
var CURRENT_CACHES = {
    prefetch: 'prefetch-cache-v' + CACHE_VERSION
};

var precacheFiles = [
    "/bundles/css",
    "/bundles/nuget-js",
    "/bundles/app-js",
    "/favicon.png",

    "/Content/images/bilibili.png",
    "/Content/images/dailymotion.png",
    "/Content/images/grandmonsieur.png",
    "/Content/images/niconico.png",
    "/Content/images/preloader.gif",
    "/Content/images/yt_icon_rgb.png"
];

var ignoreRequests = new RegExp('(' +
    [
        '/signalr'
    ].join('(\/?)|\\') + ')$');


self.addEventListener('install', function (evt) {
    console.log('The service worker is being installed.');
    evt.waitUntil(precache().then(function () {
        console.log('Skip waiting on install');
        return self.skipWaiting();
    }));
});

self.addEventListener('activate', function (event) {
    console.log('Claiming clients for current page');
    return self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
    var req = evt.request.clone();
    if (req.method === "GET") {

        if (ignoreRequests.test(event.request.url)) {
            console.log('ignored: ', event.request.url);
            return;
        }

        console.log('The service worker is serving the asset.' + evt.request.url);

        evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
        evt.waitUntil(update(evt.request));
        // update(evt.request);
    }
});


function precache() {
    return caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
        if (!cache)
            return Promise.reject('cache open error');

        return cache.addAll(precacheFiles);
    });
}

function fromCache(request) {
    return caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
        if (!cache) {
            return fromServer(request);
        }
        return cache.match(request).then(function (matching) {
            return matching || Promise.reject('no-match');
        });
    });
}

function update(request) {
    return caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
        return fetch(request).then(function (response) {
            return cache.put(request, response);
        });
    });
}


function upsert(request) {
    return caches.open(CURRENT_CACHES.prefetch).then(function (cache) {
        if (!cache) {
            return Promise.reject('Service workers are not supported. It does not work properly in the browser when debugging is running');
        }

        return fetch(request).then(function (response) {
            cache.put(request, response);
            return response;
        });
    });
}

function fromServer(request) {
    return fetch(request).then(function (response) { return response; });
}