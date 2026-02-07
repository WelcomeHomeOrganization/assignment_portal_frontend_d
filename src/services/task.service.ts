"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { Task, PaginationMeta, TasksResponse, PriorityLevels, TaskStatus } from "@/features/tasks/types";

export interface GetTasksResult {
    tasks: Task[];
    meta: PaginationMeta;
}

export async function getTasks(page: number = 1, limit: number = 10): Promise<GetTasksResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    const emptyResult: GetTasksResult = {
        tasks: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const response = await fetch(`${baseUrl}/task?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch tasks:", response.statusText);
            return emptyResult;
        }

        const data: TasksResponse = await response.json();

        return {
            tasks: data.tasks || [],
            meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
    } catch (error) {
        console.error("Error fetching tasks list:", error);
        return emptyResult;
    }
}

export async function getTaskById(id: string): Promise<Task | null> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/task/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch task:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.task || null;
    } catch (error) {
        console.error("Error fetching task:", error);
        return null;
    }
}

export interface CreateTaskData {
    title: string;
    priority: PriorityLevels;
    deadline: string;
    parentId?: string;
    ideaId?: string;
    description?: string;
    status?: TaskStatus;
    assignedTo?: string[];
    fileIds?: string[];
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    task?: Task;
}

export async function createTask(taskData: CreateTaskData): Promise<ApiResponse> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        const response = await fetch(`${baseUrl}/task`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Failed to create task"
            };
        }

        return {
            success: true,
            message: "Task created successfully",
            task: data.task
        };
    } catch (error) {
        console.error("Error creating task:", error);
        return {
            success: false,
            message: "An error occurred while creating the task"
        };
    }
}

export async function extendTaskDeadline(taskId: string, deadline: string): Promise<{ success: boolean; message: string; extendedDeadline?: any }> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        const response = await fetch(`${baseUrl}/task/extend-deadline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId, deadline }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || "Failed to extend deadline" };
        }

        return { success: true, message: "Deadline extended successfully", extendedDeadline: data.extendedDeadline };
    } catch (error) {
        console.error("Error extending deadline:", error);
        return { success: false, message: "Failed to extend deadline" };
    }
}
