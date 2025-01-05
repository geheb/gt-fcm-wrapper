import { FirebaseOptions, initializeApp } from 'firebase/app';
import { getMessaging, isSupported, getToken, Messaging } from 'firebase/messaging'

export declare interface MessagingConfig {
  firebaseConfig: FirebaseOptions,
  vapidKey: string,
  serviceWorkerPath: string
};

const hasNotificationPermission = () => {
  try {
    return Notification.permission === "granted";
  } catch (error) {
    console.error("An error occurred while reading permission", error);
    return false;
  }
};

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("An error occurred while requesting permission", error);
    return false;
  }
};

const requestToken = async (messaging: Messaging, vapidKey: string, sw: ServiceWorkerRegistration) => {
  return await getToken(messaging, { vapidKey: vapidKey, serviceWorkerRegistration: sw })
    .then(token => token)
    .catch(_ => new Promise(r => setTimeout(r, 1000)))
    .then(() => getToken(messaging, { vapidKey: vapidKey, serviceWorkerRegistration: sw }))
    .catch(error => {
      console.error("An error occurred while requesting token from FCM", error);
      return null;
    });
};

export const startMessaging = async (config: MessagingConfig) => {
  const hasSupport = await isSupported();
  if (!hasSupport) {
    console.error('Browser does not support web notifications');
    return null;
  }
  const app = initializeApp(config.firebaseConfig);
  const messaging = getMessaging(app);
  if (!hasNotificationPermission()) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }
  }

  // triggerd by lib if window is active, chrome only
  navigator.serviceWorker.addEventListener("message", (event) => {
    const data = event.data?.data;
    if (data?.title && data?.body) {
      var notify = new Notification(data.title, {
        body: data.body,
        icon: data.icon,
      });
      if (data.url) {
        notify.onclick = function () {
          window.open(new URL(data.url));
        };
      }
    }
  });

  const sw = await navigator.serviceWorker.register(config.serviceWorkerPath);
  const token = await requestToken(messaging, config.vapidKey, sw);
  return token;
};
