importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD19M2dBQhQxD1k7ccMOAXvrdCGHqmHJxY",
  authDomain: "daewooteam5-432ae.firebaseapp.com",
  projectId: "daewooteam5-432ae",
  storageBucket: "daewooteam5-432ae.firebasestorage.app",
  messagingSenderId: "606340091565",
  appId: "1:606340091565:web:f53b11b438736735e64024",
  measurementId: "G-WWWX6W1XSF"
});

const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.data?.title || '기본 알림 제목';
  const notificationOptions = {
    body: payload.data?.body || '기본 알림 내용',
    icon: '/images/logo.png',
    data: {
      click_action: payload.data?.click_action || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 동작
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click Received.', event);

  event.notification.close(); // 알림 닫기

  const clickAction = event.notification.data?.click_action || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let client of windowClients) {
        if (client.url === clickAction && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
