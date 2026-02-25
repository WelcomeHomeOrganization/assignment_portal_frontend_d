importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: 'AIzaSyDz0agY8MWJofGFacE1WGXKKAdIeD8Jb3w',
    authDomain: 'assignment-portal-2b6ab.firebaseapp.com',
    projectId: 'assignment-portal-2b6ab',
    storageBucket: 'assignment-portal-2b6ab.firebasestorage.app',
    messagingSenderId: '892979931988',
    appId: '1:892979931988:web:d37f9238c37d8527a276c1'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log("Background message:", payload);

    const notificationTitle =
        payload.notification?.title || "New Notification";

    const notificationOptions = {
        body: payload.notification?.body || "You have a new message",
        icon: "/icon-192.png",
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});