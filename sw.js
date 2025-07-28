// EverTest Service Worker for Enhanced Performance
// Version 1.0.0

const CACHE_NAME = 'evertest-v1.0.0';
const STATIC_CACHE = 'evertest-static-v1.0.0';
const DYNAMIC_CACHE = 'evertest-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/modern-style.css',
    '/js/modern-script.js',
    '/img/Logo.png',
    '/img/macbook.jpg',
    '/icons/favicon-32x32.png',
    '/icons/apple-icon-180x180.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Precaching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(err => console.log('Service Worker: Cache failed', err))
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip chrome extension requests
    if (event.request.url.startsWith('chrome-extension://')) return;
    
    // Skip external analytics requests
    if (event.request.url.includes('google-analytics.com') || 
        event.request.url.includes('heapanalytics.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(fetchResponse => {
                        // Check if we received a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }
                        
                        // Clone the response as it can only be consumed once
                        const responseToCache = fetchResponse.clone();
                        
                        // Add to dynamic cache for future use
                        caches.open(DYNAMIC_CACHE)
                            .then(cache => {
                                // Only cache same-origin requests
                                if (event.request.url.startsWith(self.location.origin)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });
                        
                        return fetchResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, return offline page for HTML requests
                        if (event.request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for form submissions (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

// Handle background sync for contact form
function syncContactForm() {
    // This would handle offline form submissions
    // For now, just log the attempt
    console.log('Service Worker: Attempting to sync contact form submissions');
    return Promise.resolve();
}

// Handle push notifications (if implemented in future)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icons/android-icon-192x192.png',
            badge: '/icons/android-icon-96x96.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'View Details',
                    icon: '/icons/android-icon-96x96.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/icons/android-icon-96x96.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Monitor for updates
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('EverTest Service Worker registered successfully');