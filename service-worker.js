const CACHE_NAME = "map-marker-cache-v1";

const ASSETS = [
  "./",
  "./mondamin.html",
  "./markerApi.js",
  "./markerJson.js",
  "./mondamin_map.png"
];

// install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});