if (!self.define) {
    let e, s = {};
    const n = (n, a) => (n = new URL(n + ".js", a).href, s[n] || new Promise((s => {
      if ("document" in self) {
        const e = document.createElement("script");
        e.src = n, e.onload = s, document.head.appendChild(e)
      } else e = n, importScripts(n), s()
    })).then((() => {
      let e = s[n];
      if (!e) throw new Error(`Module ${n} didn’t register its module`);
      return e
    })));
    self.define = (a, i) => {
      const t = e || ("document" in self ? document.currentScript.src : "") || location.href;
      if (s[t]) return;
      let c = {};
      const r = e => n(e, t),
        o = { module: { uri: t }, exports: c, require: r };
      s[t] = Promise.all(a.map((e => o[e] || r(e)))).then((e => (i(...e), c)))
    }
}

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'UPDATE_CACHE') {
    const { url, id, updatedData } = event.data;

    try {
 
      const cache = await caches.open('apis'); 
      const cachedResponse = await cache.match(url); 

      if (cachedResponse) {
        const cachedData = await cachedResponse.json();
        // console.log('Cached data before modification:', cachedData);


        const updatedCards = cachedData.map((card) =>
          card.id === id ? { ...card, ...updatedData } : card
        );

        // console.log('Modified data:', updatedCards);


        const newResponse = new Response(JSON.stringify(updatedCards), {
          headers: { 'Content-Type': 'application/json' },
        });
        await cache.put(url, newResponse);

        // console.log(`Cache updated successfully for URL: ${url}`);
      } else {
        console.warn(`No cached response found for URL: ${url}`);
      }
    } catch (error) {
      console.error('Failed to update cache:', error);
    }
  }
});


define( ["./workbox-4754cb34"],(function(e){"use strict";
            importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/1.svg",revision:"dc9c522631d560eb5e7a02d5fc9f811c"},
                {url:"/_next/app-build-manifest.json",revision:"434af078512000203212119bf342c673"},
                {url:"/_next/static/KIP1vya2CxyOtr2R3Secg/_buildManifest.js",revision:"0aca70d443b080b584279ba9297e10bd"},
                {url:"/_next/static/KIP1vya2CxyOtr2R3Secg/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},
                {url:"/_next/static/chunks/26.a96de1de66f330e7.js",revision:"a96de1de66f330e7"},
                {url:"/_next/static/chunks/909-d44b9634de8b1ca8.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/94726e6d-a2a1faac44f64e65.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/d2094a0f-d2460aca0a65dba7.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/d3048c20-a9e7de0dd9569e44.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/fd9d1056-2821b0f0cabcd8bd.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/framework-95cf2e826dc5f62b.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/main-0898e53d902f13dd.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/main-app-1159fac77bf86d1e.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/pages/_app-d41478ddfd955caf.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/pages/_error-1be831200e60c5c0.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/pages/index-9fcaab5cffba2d1c.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},
                {url:"/_next/static/chunks/webpack-315b81fd10b0de6d.js",revision:"KIP1vya2CxyOtr2R3Secg"},
                {url:"/_next/static/css/6c5ea4b43b69fd25.css",revision:"6c5ea4b43b69fd25"},
                {url:"/delete_tile.svg",revision:"8990f50683abe1adb4c729177dbaee8b"},
                {url:"/filter_circle.svg",revision:"f87fe54778644f7c2e47b2b2616094d4"},
                {url:"/filter_location.svg",revision:"122fdb532842d1ec4d6150310b2f7324"},
                {url:"/filter_new.svg",revision:"88d7817c9d2af2b88f6c9638827ae598"},
                {url:"/filter_stream.svg",revision:"a760e4b59996a150c513ac1658c24cf5"},
                {url:"/filter_stream_clean.svg",revision:"8886c75aed841152b1c447ef8dbdd980"},
                {url:"/filter_token.svg",revision:"01ec5acbdbe84372d0e63a842a699224"},
                {url:"/filter_token__old.svg",revision:"5fc80cd52dde57a6be8e3d9b0ca381bd"},
                {url:"/icon.svg",revision:"01b7a0ded700839b2dd1f33e934134e9"},
                {url:"/manifest.json",revision:"061198c667f86bab86b53befad710759"},
                {url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},
                {url:"/noise.png",revision:"6f786ec6e8318c38bd5ca96b7ecd603c"},
                {url:"/noun-abstract-1359467.svg",revision:"1d9d13890927b565df263c4a720011d4"},
                {url:"/noun-circles-1625990.svg",revision:"4b60e4ea6a4342a3c350d9e3f4c39de9"},
                {url:"/noun-connections-728045.svg",revision:"4e5bb9f4219f447b191a62e066f63c3a"},
                {url:"/noun-map-6993876.svg",revision:"d5449965d18f64afd9d8e9571c19ee65"},
                {url:"/noun-stellated-dodecahedron-577336.svg",revision:"0d61b28bd44710b9bf44c1825219dd08"},
                {url:"/noun-supersonic-485621.svg",revision:"f31b58418934fd7c957830da571f863a"},
                {url:"/noun-torus-551663.svg",revision:"4fbb62fa217e17e2288dd33c29c69f83"},
                {url:"/noun-venn-diagram-3818708.svg",revision:"82426c2d5723f9edaa65847f18f2f280"},
                {url:"/vercel.svg",revision:"5315f6dfe74df63862b555689eb37688"},
                {url:"/vercel_old.svg",revision:"61c6b19abff40ea7acd577be818f3976"}],
                {
                    ignoreURLParametersMatching:[]}),
                e.cleanupOutdatedCaches(),
                e.registerRoute("/", new e.StaleWhileRevalidate({
                    cacheName: "start-url",
                    plugins: [{
                      cacheWillUpdate: async ({ request: e, response: s, event: n, state: a }) => s && "opaqueredirect" === s.type ? new Response(s.body, { status: 200, statusText: "OK", headers: s.headers }) : s
                    }]
                  }), "GET");

                  e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i, new e.CacheFirst({
                    cacheName: "google-fonts-webfonts",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })]
                  }), "GET");

                  e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i, new e.StaleWhileRevalidate({
                    cacheName: "google-fonts-stylesheets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
                  }), "GET");

                  e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i, new e.StaleWhileRevalidate({
                    cacheName: "static-font-assets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
                  }), "GET");

                  e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, new e.StaleWhileRevalidate({
                    cacheName: "static-image-assets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\/_next\/image\?url=.+$/i, new e.StaleWhileRevalidate({
                    cacheName: "next-image",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\.(?:mp3|wav|ogg)$/i, new e.CacheFirst({
                    cacheName: "static-audio-assets",
                    plugins: [new e.RangeRequestsPlugin ]
                  }), "GET");

                  e.registerRoute(/\.(?:mp4)$/i, new e.CacheFirst({
                    cacheName: "static-video-assets",
                    plugins: [new e.RangeRequestsPlugin, new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\.(?:js)$/i, new e.StaleWhileRevalidate({
                    cacheName: "static-js-assets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\.(?:css|less)$/i, new e.StaleWhileRevalidate({
                    cacheName: "static-style-assets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i, new e.StaleWhileRevalidate({
                    cacheName: "next-data",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
                  }), "GET");

                  e.registerRoute(/\.(?:json|xml|csv)$/i, new e.NetworkFirst({
                    cacheName: "static-data-assets",
                    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
                  }), "GET");


                  e.registerRoute((({ url: e }) => !(self.origin === e.origin)), new e.NetworkFirst({
                    cacheName: "cross-origin",
                    networkTimeoutSeconds: 10,
                    plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })]
                  }), "GET");
            }
        )
    );


        