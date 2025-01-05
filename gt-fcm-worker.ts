/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

import { FirebaseOptions, initializeApp } from 'firebase/app';
import { MessagePayload, getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare var firebaseConfig: FirebaseOptions;

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

self.addEventListener('notificationclick', async (event: NotificationEvent) => {
  event.stopImmediatePropagation();
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    await self.clients.openWindow(new URL(url));
  }
});

onBackgroundMessage(messaging, async (payload: MessagePayload) => {
  const data = payload?.data;
  if (data?.title && data?.body) {
    const notificationOption: NotificationOptions = {
      body: data.body,
      icon: data.icon,
      data: {
        url: data.url
      }
    };
    await self.registration.showNotification(data.title, notificationOption);
  }
});
