"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { NotificationResponse } from "@/features/notifications/types";

export interface GetNotificationsResult {
    notifications: NotificationResponse["notifications"];
    meta: NotificationResponse["meta"];
}

const emptyResult: GetNotificationsResult = {
    notifications: [],
    meta: { page: 1, limit: 20, total: 0, totalPages: 0 }
};

export async function getNotifications(page: number = 1, limit: number = 20): Promise<GetNotificationsResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const response = await fetch(`${baseUrl}/notifications?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch notifications:", response.statusText);
            return emptyResult;
        }

        const data: NotificationResponse = await response.json();

        return {
            notifications: data.notifications || [],
            meta: data.meta || emptyResult.meta
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return emptyResult;
    }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return false;
    }

    try {
        const response = await fetch(`${baseUrl}/notifications/${id}/read`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.ok;
    } catch (error) {
        console.error(`Error marking notification ${id} as read:`, error);
        return false;
    }
}

export async function markAllNotificationsAsRead(): Promise<boolean> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return false;
    }

    try {
        const response = await fetch(`${baseUrl}/notifications/read-all`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        return response.ok;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return false;
    }
}

export async function registerDeviceToken(token: string): Promise<boolean> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return false;
    }

    try {
        const response = await fetch(`${baseUrl}/notifications/token`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                platform: "WEB"
            })
        });

        if (!response.ok) {
            console.error("Failed to register device token:", response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error registering device token:", error);
        return false;
    }
}
