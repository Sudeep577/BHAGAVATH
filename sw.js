const CACHE_NAME = "mybhagavanth-static-v5";
const STATIC_ASSETS = [
    "./",
    "./home.html",
    "./index.html",
    "./login.html",
    "./profile.html",
    "./history.html",
    "./about.html",
    "./astrology.html",
    "./dailylearning.html",
    "./lovegame.html",
    "./style.css",
    "./subpages.css",
    "./auth.css",
    "./astrology.css",
    "./lovegame.css",
    "./script.js",
    "./auth.js",
    "./profile.js",
    "./history.js",
    "./about.js",
    "./home.js",
    "./astrology.js",
    "./dailylearning.js",
    "./lovegame.js",
    "./app-common.js",
    "./pwa.js",
    "./manifest.webmanifest",
    "./icon-192.svg",
    "./icon-512.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (url.pathname.endsWith("/api.php") || url.pathname.endsWith("api.php")) {
        return;
    }

    // Network-first for all same-origin requests
    event.respondWith(
        fetch(request)
            .then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                return response;
            })
            .catch(() =>
                caches.match(request, { ignoreSearch: true })
                    .then((cached) => cached || caches.match("./index.html"))
            )
    );
});