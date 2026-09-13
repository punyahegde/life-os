const CACHE='lifeos-v2';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest','./icon.svg']))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html')))));
self.addEventListener('push',e=>{
 let data={title:'Life OS',body:'Time for your next routine task.'};
 try{data={...data,...e.data.json()}}catch(_){try{data.body=e.data.text()}catch(_){}}
 e.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'icon.svg',badge:'icon.svg',tag:data.tag||'lifeos-routine',sound:'default',data:{url:'./'}}));
});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus'in c)return c.focus()}return clients.openWindow('./')}));});
