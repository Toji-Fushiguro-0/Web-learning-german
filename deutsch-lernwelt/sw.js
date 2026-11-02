// sw.js — Service Worker cho PWA: cache vỏ ứng dụng, mở offline.
// Mỗi lần sửa danh sách file hoặc nội dung, tăng CACHE_NAME để buộc cập nhật.

const CACHE_NAME = "deutsch-lernwelt-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/style.css",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./data/embedded-data.js",
  "./data/grammar.json",
  "./data/vocabulary.json",
  "./data/placement.json",
  "./js/i18n.js",
  "./js/data-loader.js",
  "./js/data-validator.js",
  "./js/storage.js",
  "./js/grammar-data.js",
  "./js/grammar.js",
  "./js/vocabulary.js",
  "./js/placement.js",
  "./js/study-plan.js",
  "./js/mistakes.js",
  "./js/error-detective.js",
  "./js/sync-core.js",
  "./js/cloud-sync.js",
  "./js/preview.js",
  "./js/app.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;
  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
