const CACHE='smart-scale-site-v6';
const ASSETS=['./','./index.html','./styles.css','./app.js','./impact.mjs','./content.mjs','./workload.mjs','./workload-ui.mjs','./pwa.mjs','./manifest.webmanifest','./favicon.svg','./assets/smart-scale-logo.png','./assets/app-icon-192.png','./assets/app-icon-512.png','./assets/apple-touch-icon.png'];
const assetPaths=new Set(ASSETS.map(path=>new URL(path,self.registration.scope).pathname));
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('smart-scale-site-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.search||(!assetPaths.has(url.pathname)&&request.mode!=='navigate'))return;
  event.respondWith((async()=>{
    try{const response=await fetch(request);if(response.ok&&response.type==='basic'){const cache=await caches.open(CACHE);await cache.put(request,response.clone());}return response;}
    catch(error){const cached=await caches.match(request);if(cached)return cached;if(request.mode==='navigate'){const shell=await caches.match(new URL('./index.html',self.registration.scope));if(shell)return shell;}throw error;}
  })());
});
