"use server";

import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { Employee, PaginationMeta, EmployeesResponse, Department } from "@/features/employees/types";

export interface GetDepartmentsResult {
    departments: Department[];
}

export async function getDepartments(): Promise<GetDepartmentsResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { departments: [] };
    }

    try {
        const response = await fetch(`${baseUrl}/employee/departments`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch departments:", response.statusText);
            return { departments: [] };
        }

        const data = await response.json();
        return { departments: data.departments || [] };
    } catch (error) {
        console.error("Error fetching departments:", error);
        return { departments: [] };
    }
}

export interface GetEmployeesResult {
    employees: Employee[];
    meta: PaginationMeta;
}

export async function getEmployees(page: number = 1, limit: number = 10): Promise<GetEmployeesResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    const emptyResult: GetEmployeesResult = {
        employees: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const response = await fetch(`${baseUrl}/employee?page=${page}&limit=${limit}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch employees:", response.statusText);
            return emptyResult;
        }

        const data: EmployeesResponse = await response.json();

        return {
            employees: data.data || [],
            meta: data.meta || { page: 1, limit: 10, total: 0, totalPages: 0 }
        };
    } catch (error) {
        console.error("Error fetching employees list:", error);
        return emptyResult;
    }
}

export interface SearchEmployeesResult {
    items: Employee[];
    hasMore: boolean;
}

export async function searchEmployees(query: string = "", page: number = 1, limit: number = 20): Promise<SearchEmployeesResult> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    const emptyResult: SearchEmployeesResult = {
        items: [],
        hasMore: false
    };

    if (!session?.accessToken) {
        return emptyResult;
    }

    try {
        const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
        const response = await fetch(`${baseUrl}/employee?page=${page}&limit=${limit}${searchParam}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to search employees:", response.statusText);
            return emptyResult;
        }

        const data: EmployeesResponse = await response.json();
        const employees = data.data || [];
        const meta = data.meta || { page: 1, limit: 20, total: 0, totalPages: 0 };

        return {
            items: employees,
            hasMore: meta.page < meta.totalPages
        };
    } catch (error) {
        console.error("Error searching employees:", error);
        return emptyResult;
    }
}

// Helper for UI components to get formatted employee data
export interface EmployeeSelectItem {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    designation?: string;
    email?: string;
    avatar?: string;
}

export interface SearchEmployeesSelectResult {
    items: EmployeeSelectItem[];
    hasMore: boolean;
}

export async function searchEmployeesForSelect(query: string = "", page: number = 1, limit: number = 20): Promise<SearchEmployeesSelectResult> {
    const result = await searchEmployees(query, page, limit);
    const baseUrl = process.env.BACKEND_LINK;

    const items = result.items.map(emp => ({
        id: emp.id,
        staffId: emp.staffId,
        firstName: emp.firstName,
        lastName: emp.lastName,
        designation: emp.designation,
        email: emp.email,
        avatar: emp.profilePicture?.path
            ? `${baseUrl}/${emp.profilePicture.path.replace(/\\/g, '/')}`
            : undefined
    }));

    return {
        items,
        hasMore: result.hasMore
    };
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return null;
    }

    try {
        const response = await fetch(`${baseUrl}/employee/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch employee:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.employee || null;
    } catch (error) {
        console.error("Error fetching employee:", error);
        return null;
    }
}

export interface ApiResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
    data?: Employee;
}

export async function createEmployee(employeeData: Record<string, unknown>): Promise<ApiResponse> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const response = await fetch(`${baseUrl}/employee`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employeeData),
        });

        const data = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Failed to create employee",
                errors: data.errors,
            };
        }

        return { success: true, message: "Employee created successfully", data: data.employee };
    } catch (error) {
        console.error("Error creating employee:", error);
        return { success: false, message: "An error occurred while creating the employee" };
    }
}

export async function updateEmployee(id: string, employeeData: Record<string, unknown>): Promise<ApiResponse> {
    const baseUrl = process.env.BACKEND_LINK;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session?.accessToken) {
        return { success: false, message: "Unauthorized" };
    }
    try {
        const response = await fetch(`${baseUrl}/employee/${id}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(employeeData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || "Failed to update employee",
                errors: data.errors,
            };
        }

        return { success: true, message: "Employee updated successfully" };
    } catch (error) {
        console.error("Error updating employee:", error);
        return { success: false, message: "An error occurred while updating the employee" };
    }
}
