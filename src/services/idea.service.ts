"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { Idea, PaginationMeta, IdeasResponse } from "@/features/ideas/types";

export interface GetIdeasResult {
    ideas: Idea[];
    meta: PaginationMeta;
}

export async function getIdeas(page: number = 1, limit: number = 10): Promise<GetIdeasResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);
    // console.log(session?.accessToken)

    const emptyResult: GetIdeasResult = {
        ideas: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const response = await fetch(`${baseUrl}/idea?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch ideas:", response.statusText);
            return emptyResult;
        }

        const data: IdeasResponse = await response.json();

        return {
            ideas: data.ideas || [],
            meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
    } catch (error) {
        console.error("Error fetching ideas list:", error);
        return emptyResult;
    }
}

export interface SearchIdeasResult {
    items: Idea[];
    hasMore: boolean;
}

export async function searchIdeas(query: string = "", page: number = 1, limit: number = 20): Promise<SearchIdeasResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    const emptyResult: SearchIdeasResult = {
        items: [],
        hasMore: false
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
        const response = await fetch(`${baseUrl}/idea?page=${page}&limit=${limit}${searchParam}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to search ideas:", response.statusText);
            return emptyResult;
        }

        const data: IdeasResponse = await response.json();
        const ideas = data.ideas || [];
        const meta = data.meta || { page: 1, limit: 20, total: 0, totalPages: 0 };

        return {
            items: ideas,
            hasMore: meta.page < meta.totalPages
        };
    } catch (error) {
        console.error("Error searching ideas:", error);
        return emptyResult;
    }
}

export async function getMyIdeas(): Promise<GetIdeasResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    const emptyResult: GetIdeasResult = {
        ideas: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const response = await fetch(`${baseUrl}/idea/employee`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch my ideas:", response.statusText);
            return emptyResult;
        }

        const data: IdeasResponse = await response.json();

        return {
            ideas: data.ideas || [],
            meta: { page: 1, limit: data.ideas?.length || 0, total: data.ideas?.length || 0, totalPages: 1 }
        };
    } catch (error) {
        console.error("Error fetching my ideas:", error);
        return emptyResult;
    }
}


export interface ApiResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

export async function createIdea(ideaData: { title: string; description: string; visibility?: string; employeeIds?: string[]; departmentIds?: string[] }): Promise<ApiResponse> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    // console.log(session?.accessToken)
    if (!session?.accessToken) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const response = await fetch(`${baseUrl}/idea`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ideaData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Failed to create idea",
                errors: data.errors,
            };
        }

        return { success: true, message: "Idea created successfully" };
    } catch (error) {
        console.error("Error creating idea:", error);
        return { success: false, message: "An error occurred while creating the idea" };
    }
}

export async function updateIdea(id: string, ideaData: { title: string; description: string; visibility?: string; employeeIds?: string[]; departmentIds?: string[] }): Promise<ApiResponse> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const response = await fetch(`${baseUrl}/idea/${id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(ideaData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Failed to update idea",
                errors: data.errors,
            };
        }

        return { success: true, message: "Idea updated successfully" };
    } catch (error) {
        console.error("Error updating idea:", error);
        return { success: false, message: "An error occurred while updating the idea" };
    }
}

