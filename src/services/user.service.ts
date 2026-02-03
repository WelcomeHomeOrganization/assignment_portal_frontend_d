"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { Profile } from "@/features/dashboard/profile/types";

export async function getUserProfile(userId: string): Promise<Profile | null> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/user/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch profile:", response.statusText);
            return null;
        }

        const { user, department } = await response.json();
        const e = user.employee;

        return {
            id: e.staffId,
            name: `${e.firstName} ${e.lastName}`,
            email: user.email ?? "",
            phone: e.mobileNumber,
            gender: e.gender,
            status: e.status === "active" ? "ACTIVE" : "INACTIVE",
            employmentType: e.employmentType,
            joinedAt: e.joinDate,
            lastDate: e.lastDate ?? "N/A",
            department: department ?? "N/A",
            avatarUrl: e.profilePicture?.path
                ? `${baseUrl}/${e.profilePicture.path.replace(/\\/g, '/')}` // replace backslashes
                : `https://i.pravatar.cc/150?u=${userId}`,

        };
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

export async function getAllUsers(): Promise<Profile[]> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return [];
    }

    try {
        const response = await fetch(`${baseUrl}/user`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch users:", response.statusText);
            return [];
        }

        const data = await response.json();

        console.log(data)
        // Handle array response
        if (!Array.isArray(data)) {
            console.error("Expected array for users list, got:", typeof data);
            return [];
        }

        return data.map((item: any) => {
            const u = item.user || {};
            const e = u.employee || {};
            const d = item.department || "N/A";

            return {
                id: e.staffId || item.id,
                name: e.firstName ? `${e.firstName} ${e.lastName || ""}` : (u.name || "Unknown"),
                email: u.email || "",
                phone: e.mobileNumber || "",
                gender: e.gender || "",
                status: e.status === "active" ? "ACTIVE" : "INACTIVE",
                employmentType: e.employmentType || "N/A",
                joinedAt: e.joinDate || "N/A",
                lastDate: e.lastDate || "N/A",
                department: d,
                avatarUrl: e.profilePicture?.path
                    ? `${baseUrl}/${e.profilePicture.path.replace(/\\/g, '/')}`
                    : `https://i.pravatar.cc/150?u=${u.id || item.id}`,
            };
        });
    } catch (error) {
        console.error("Error fetching users list:", error);
        return [];
    }
}
