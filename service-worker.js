const CACHE_NAME = "map-marker-cache-v2";

const ASSETS = [
  "./",
  "./mondamin.html",
  "./markerApi.js",
  "./markerJson.js",
  "./mondamin_map.png"
];

/ install
self.addEventListener("install", (event) => {
  self.skipWaiting(); // 🔥 force update
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim(); // 🔥 take control immediately
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request);
    })
  );
});