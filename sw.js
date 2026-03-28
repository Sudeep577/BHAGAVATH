const CACHE_NAME = "mybhagavanth-static-v2";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./login.html",
    "./profile.html",
    "./history.html",
    "./style.css",
    "./subpages.css",
    "./auth.css",
    "./script.js",
    "./auth.js",
    "./profile.js",
    "./history.js",
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

    const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

    if (isHtmlRequest) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => caches.match(request).then((response) => response || caches.match("./index.html")))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then((response) => {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                return response;
            });
        })
    );
});