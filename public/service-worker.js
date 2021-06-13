const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/styles.css",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    '/service-worker.js',
    "/db.js",
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];

const CACHE_NAME = "static-budget-cache";


// Installs the service worker
self.addEventListener("install", function (event) {
    // Caches static assets
    event.waitUntil(
      caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    // Tells the browser to activate the service worker immediately once it has finished installing
    self.skipWaiting();
  });
  
  // Activates cache
  self.addEventListener("activate", function(event) {
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });
  
  // Sends cached static files to the indexedDB if offline
  self.addEventListener("fetch", (event) => {
    // Added this to prevent console error when sending transactions offline
    const { request } = event;
    if(request.method === 'GET') {
      event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
          return cache.match(event.request).then(response => {
            return response || fetch(event.request);
          });
        })
      );
    }
  });
