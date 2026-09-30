const CACHE='alevel-physics-offline-v7';
const CORE=[
  './','./index.html','./styles.css','./course-enhancements.css','./focus-layout.css','./student-notebook.css','./course-tools.css','./mobile-mode.css','./experience-polish.css','./curriculum-map.css','./lesson-content.css','./textbook.css',
  './app.js','./curriculum-map.js','./lesson-content.js','./student-notebook.js','./ai-coach.js','./course-tools.js','./mobile-mode.js','./presentation-mode.js','./textbook-data.js','./textbook.js','./textbook-phase1.js','./textbook-phase1.css','./textbook-phase2.js','./textbook-phase2.css','./textbook-phase3.js','./textbook-phase3.css','./textbook-phase4.js','./textbook-phase4.css','./textbook-phase5.js','./textbook-phase5.css','./lesson-enrichment.js','./lesson-enrichment.css',
  './lesson-automarking.js','./lesson-automarking.css','./guided-tutor-dashboard.js','./guided-tutor-dashboard.css','./lesson-navigator.js','./lesson-navigator.css','./lesson-reader-quicknav.js','./guided-tutor-mode.js','./guided-tutor-mode.css','./lesson-quality-audit.js','./lesson-quality-audit.css','./presentation-library.js','./presentation-library.css',
  './lesson-phase3.js','./lesson-phase3.css','./lesson-spec-depth.js','./lesson-spec-depth.css','./lesson-deepening.js','./lesson-deepening.css',
  './lesson-presentation-primary.js','./lesson-presentation-primary.css','./lesson-presentation-phase3.css','./lesson-presentation-controls.js','./lesson-presentation-controls.css',
  './lesson-presentation-progressive.js','./lesson-presentation-progressive.css','./lesson-presentation-visuals.js','./lesson-presentation-visuals.css',
  './lesson-presentation-practical.js','./lesson-presentation-practical.css','./lesson-presenter-view.js','./lesson-presenter-view.css','./lesson-simulations.js','./lesson-simulations.css'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(url=>cache.add(new Request(url,{cache:'reload'}))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('alevel-physics-offline-')&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(url.pathname.startsWith('/api/'))return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const fresh=await fetch(request);
      if(fresh&&fresh.ok)cache.put(request,fresh.clone()).catch(()=>{});
      return fresh;
    }catch{
      const cached=await cache.match(request,{ignoreSearch:false})||await cache.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(request.mode==='navigate')return (await cache.match('./index.html'))||(await cache.match('./'));
      throw new Error('Offline resource unavailable');
    }
  })());
});