const { response } = require("express");

const CACHE_NAME = "budget-tracker-cache";
const DATA_CACHE_NAME = "budget-tracker-data-cache";

const toCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
];

self.addEventListener("install", (e) =>
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("your files were successfully pre-cached!");
      return cache.addAll(toCache);
    })
  )
);

self.addEventListener("fetch", (e) => {
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(e.request)
            .then((res) => {
              if (res.status === 200) {
                cache.put(e.request.url, res.clone());
              }
              return res;
            })
            .catch((err) => cache.match(e.request));
        })
        .catch((err) => console.log(err))
    );
    return;
  }
  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then((res) => {
        if (res) {
          return res;
        } else if (e.request.headers.get("accept").includes("text/html")) {
          return caches.match("/");
        }
      });
    })
  );
});
