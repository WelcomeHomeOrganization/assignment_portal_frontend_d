export interface Creator {
    id: string;
    staffId: string;
    designation?: string | null;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string | null;
    gender: string;
    employmentType: string;
    joinDate: string;
    lastDate: string | null;
    status: string;
    profilePicture?: { path: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeAccess {
    id: string;
    ideaId: string;
    employeeId: string;
    employee: Creator;
}

export interface DepartmentAccess {
    id: string;
    ideaId: string;
    departmentId: string;
    department?: {
        id: string;
        name: string;
    };
}

export interface Idea {
    id: string;
    title: string;
    description: string;
    visibility?: 'public' | 'private';
    employeeIds?: string[];
    departmentIds?: string[];
    employeeAccesses?: EmployeeAccess[];
    departmentAccesses?: DepartmentAccess[];
    creator: Creator;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface IdeasResponse {
    statusCode: number;
    ideas: Idea[];
    meta: PaginationMeta;
}
