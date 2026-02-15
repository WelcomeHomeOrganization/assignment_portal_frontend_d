export interface ProfilePicture {
    id: string;
    uniqueName: string;
    originalName: string;
    path: string;
    mimeType: string;
    sizeKb: string;
    storage: string;
    usedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    id: string;
    staffId: string;
    department: Department | null;
    designation: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string | null;
    gender: string;
    employmentType: string;
    joinDate: string;
    lastDate: string | null;
    status: string;
    profilePicture: ProfilePicture | null;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface EmployeesResponse {
    statusCode: number;
    data: Employee[];
    meta: PaginationMeta;
}

// Enums matching backend
export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

export enum EmploymentType {
    FULL_TIME = 'full-time',
    PART_TIME = 'part-time',
    CONTRACTUAL = 'contractual',
    INTERN = 'intern',
}

// Create Employee DTO
export interface CreateEmployeeDto {
    staffId: string;
    designation: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber?: string | null;
    gender: Gender;
    employmentType: EmploymentType;
    joinDate: string;
    lastDate?: string | null;
    status: Status;
    departmentId?: string | null;
    fileId?: string | null;
}

// Update Employee DTO (all fields optional)
export interface UpdateEmployeeDto {
    staffId?: string;
    designation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string | null;
    gender?: Gender;
    employmentType?: EmploymentType;
    joinDate?: string;
    lastDate?: string | null;
    status?: Status;
    departmentId?: string | null;
    fileId?: string | null;
}
