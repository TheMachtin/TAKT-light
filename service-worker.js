// Offline-Betrieb für TAKT light. Die App muss in der Halle ohne Empfang
// starten, darf sich aber nicht mitten in der Schicht selbst austauschen.
//
// Bei jeder Veröffentlichung SPEICHERSTAND hochzählen – zusammen mit VERSION
// in index.html, sonst merkt der Browser nichts von der neuen Fassung.
const SPEICHERSTAND = 'takt-light-1.0.0';

const DATEIEN = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

// Bewusst ohne skipWaiting: die neue Fassung wartet, bis die Seite grünes
// Licht gibt. Sonst würde mitten in der Schicht umgeschaltet, während die
// laufende Seite noch mit dem alten Code arbeitet.
self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(SPEICHERSTAND).then(speicher => speicher.addAll(DATEIEN))
  );
});

self.addEventListener('message', (ereignis) => {
  if(ereignis.data && ereignis.data.typ === 'jetztWechseln') self.skipWaiting();
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches.keys()
      .then(namen => Promise.all(
        namen.filter(name => name !== SPEICHERSTAND).map(name => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

// Für die Seite selbst zuerst das Netz fragen, damit eine neue Version
// überhaupt bemerkt wird; ohne Empfang kommt sie aus dem Speicher. Symbole und
// sonstige Dateien zuerst aus dem Speicher, die ändern sich kaum.
self.addEventListener('fetch', (ereignis) => {
  if(ereignis.request.method !== 'GET') return;

  const ablegen = (antwort) => {
    const kopie = antwort.clone();
    caches.open(SPEICHERSTAND).then(speicher => speicher.put(ereignis.request, kopie));
    return antwort;
  };

  const istSeite = ereignis.request.mode === 'navigate' ||
                   ereignis.request.destination === 'document';

  if(istSeite){
    ereignis.respondWith(
      fetch(ereignis.request)
        .then(ablegen)
        .catch(() => caches.match(ereignis.request)
          .then(gespeichert => gespeichert || caches.match('./index.html')))
    );
    return;
  }

  ereignis.respondWith(
    caches.match(ereignis.request).then(gespeichert =>
      gespeichert || fetch(ereignis.request).then(ablegen).catch(() => gespeichert)
    )
  );
});
