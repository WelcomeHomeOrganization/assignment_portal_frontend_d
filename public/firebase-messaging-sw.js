// 1. Update imports to v12.9.0 compat libraries
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');


const urlParams = new URLSearchParams(location.search);

firebase.initializeApp({
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('projectId') + '.firebaseapp.com', // Derived from projectId
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('projectId') + '.firebasestorage.app',
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
});
const messaging = firebase.messaging();

// // 3. Handle background messages gracefully
// messaging.onBackgroundMessage((payload) => {
//     console.log("[firebase-messaging-sw.js] Background message received:", payload);

//     // Note: Because your backend sends a "notification" object (title/body), 
//     // Firebase will AUTOMATICALLY display a standard notification. 
//     // If you want to strictly use this custom showNotification logic below 
//     // (to add custom icons or actions), you must remove the "notification" 
//     // object from your backend NestJS code and ONLY send a "data" object.

//     // const notificationTitle = payload.notification?.title || payload.data?.title || "New Notification";
//     // const notificationOptions = {
//     //     body: payload.notification?.body || payload.data?.message || "You have a new message",
//     //     icon: "/icon-192.png",
//     //     data: payload.data,
//     // };
//     const notificationTitle = payload.data?.title || "New Notification";

//     const notificationOptions = {
//         body: payload.data?.body || "You have a new message",
//         icon: "/icon-192.png",
//         data: payload.data,
//     };
//     return self.registration.showNotification(notificationTitle, notificationOptions);
// });

self.addEventListener("push", function (event) {
    if (!event.data) return;

    const payload = event.data.json();

    // console.log("Push received:", payload);

    const data = payload.data || {};

    const title = data.title || "New Notification";

    const options = {
        body: data.body || "You have a new message",
        icon: "/icon-192.png",
        data: data,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});