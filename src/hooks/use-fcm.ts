"use client";

import { useEffect, useState } from "react";
import { messaging, getToken, onMessage } from "@/lib/firebase";
import { registerDeviceToken } from "@/services/notification.service";
import { toast } from "sonner";

export const useFCM = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);

    useEffect(() => {
        // 1. Declare unsubscribe outside the async function
        let unsubscribeFromMessages: (() => void) | undefined;

        const init = async () => {
            try {
                if (!("serviceWorker" in navigator)) return;

                // ⭐ 1. Move swUrl inside the useEffect so it only runs on the client
                const swUrl = `/firebase-messaging-sw.js?apiKey=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}&projectId=${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}&messagingSenderId=${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}&appId=${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}`;

                // ⭐ 2. Register the service worker using the swUrl with your env variables
                const registration = await navigator.serviceWorker.register(swUrl);
                // console.log("Service Worker registered:", registration);

                // ⭐ ask permission safely
                if (!("Notification" in window)) return;

                const permission = await Notification.requestPermission();
                // console.log("Notification permission:", permission);
                if (permission !== "granted") return;

                const msg = await messaging();
                // console.log("FCM messaging instance:", msg);
                if (!msg) return;

                const token = await getToken(msg, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                // console.log("FCM Token Generated:", token);

                if (token) {
                    setFcmToken(token);
                    // always send (backend deduplicates)
                    await registerDeviceToken(token);
                }

                // ⭐ foreground listener (SAFE)
                unsubscribeFromMessages = onMessage(msg, (payload) => {
                    // console.log("Foreground message received:", payload);
                    // toast("New Notification From FCM", {
                    //     description:
                    //         payload.notification?.title ||
                    //         payload.notification?.body ||
                    //         "You have a new message",
                    // });
                });

            } catch (err) {
                console.error("FCM error:", err);
            }
        };

        init();

        // 3. Return a cleanup function directly to useEffect
        return () => {
            if (unsubscribeFromMessages) {
                unsubscribeFromMessages();
            }
        };
    }, []);

    return { fcmToken };
};