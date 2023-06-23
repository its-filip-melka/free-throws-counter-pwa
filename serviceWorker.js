const freeThrowsCounter = 'free-throws-counter-v1'
const assets = [
	'/',
	'/index.html',
	'/css/styles.css',
	'/js/app.js',
	'/images/calendar.png',
	'/images/close.png',
	'/images/delete.png',
	'/images/favicon.svg',
	'/images/repeat.png',
]

self.addEventListener('install', (installEvent) => {
	installEvent.waitUntil(
		caches.open(freeThrowsCounter).then((cache) => {
			cache.addAll(assets)
		})
	)
})

self.addEventListener('fetch', (fetchEvent) => {
	fetchEvent.respondWith(
		caches.match(fetchEvent.request).then((res) => {
			return res || fetch(fetchEvent.request)
		})
	)
})
