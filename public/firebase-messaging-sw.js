// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
  apiKey: "AIzaSyDqBCuxPmouqc0qoUfGs64aBkvGFGePv4s",
  authDomain: "seu-matrimony-e0f00.firebaseapp.com",
  projectId: "seu-matrimony-e0f00",
  storageBucket: "seu-matrimony-e0f00.firebasestorage.app",
  messagingSenderId: "1096191915802",
  appId: "1:1096191915802:web:29fe4b5d7139f4796e1ea3"
});

// Retrieve Firebase Messaging instance
const messaging = firebase.messaging();

console.log('🔧 Service Worker: Firebase Messaging initialized');

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Service Worker: Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: payload.data?.priority === 'high',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/logo.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Service Worker: Notification clicked:', event);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Get the URL to open
  const urlToOpen = event.notification.data?.link || '/dashboard';
  const fullUrl = new URL(urlToOpen, self.location.origin).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === fullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(fullUrl);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Service Worker: Notification closed:', event);
});

console.log('✅ Service Worker: Event listeners registered');
