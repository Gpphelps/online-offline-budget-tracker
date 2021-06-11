const FILEs_TO_CACHE = [
    "./",
    "./index.html",
    "./index.js",
    "./style.css",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png",
    "./manifest.webmanifest"
];

const CACHE_NAME = "static-cache-v2";
const RUNTIME = "runtime";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
        .open(CACHE_NAME)
        .then((cache) => cache.addAll(FILE_TO_CACHE))
        .then(self.skipWaiting())
    );
});

self.addEventListener("acitivate", (event) => {
    const currentCaches = [CACHE_NAME, RUNTIME];
    event.waitUntil(
        caches
        .keys()
        .then((cacheNames) => {
            return cacheNames.filter((cacheNames) => !currentCaches.includes(cacheNames));
        })
        .then((cachesToDelete) => {
            return Promise.all(
                cachesToDelete.map((cacheToDelete) => {
                    return caches.delete(cacheToDelete);
                })
            );
        })
        .then(() => self.ClientRectList.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then((cahcedResponse) => {
                if (cahcedResponse) {
                    return cahcedResponse;
                }

                return caches.open(RUNTIME).then((cache) => {
                    return fetch(event.request).then((response) => {
                        return cache.put(event.request, response.clone()).then(() => {
                            return response;
                        });
                    });
                });
            })
        );
    };
});

