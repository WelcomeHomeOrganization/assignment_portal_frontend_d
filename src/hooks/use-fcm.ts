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

                // ⭐ simple registration
                const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

                // ⭐ ask permission safely
                if (!("Notification" in window)) return;

                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;

                const msg = await messaging();
                if (!msg) return;

                const token = await getToken(msg, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
                    serviceWorkerRegistration: registration,
                });

                console.log("FCM Token Generated:", token);

                if (token) {
                    setFcmToken(token);
                    // always send (backend deduplicates)
                    await registerDeviceToken(token);
                }

                // ⭐ foreground listener (SAFE)
                // 2. Assign the listener to the outer variable
                unsubscribeFromMessages = onMessage(msg, (payload) => {
                    console.log("Foreground message received:", payload);
                    toast("New Notification From FCM", {
                        description:
                            payload.notification?.title ||
                            payload.notification?.body ||
                            "You have a new message",
                    });
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