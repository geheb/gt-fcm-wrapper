/// <reference lib="webworker" />
declare var self: ServiceWorkerGlobalScope;

import { FirebaseOptions, initializeApp } from 'firebase/app';
import { MessagePayload, getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'

declare var firebaseConfig: FirebaseOptions;

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.stopImmediatePropagation();
    event.notification.close();
    const link = event.action;
    if (link) {
        self.clients.openWindow(new URL(link));
    }   
}); 

onBackgroundMessage(messaging, (payload: MessagePayload) => {
    const data = payload?.data;
    if (data) {
        const notificationOption: NotificationOptions = {
            body:data.body,
            icon:data.icon,
            actions: []
        };
        const link = data.click_action;
        if (link) {
            const url = new URL(link, self.location.href);
            const originUrl = new URL(self.location.origin);
            if (url.host !== originUrl.host) {
                console.error("Provided link is not app's origin", link);
            } else {
                notificationOption.actions!.push({ action: link, title: 'Link' });
            }
        }
        return self.registration.showNotification(data.title ?? '', notificationOption);
    }
});
