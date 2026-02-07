// Enums
export enum TaskStatus {
    DRAFT = 'Draft',
    PENDING = 'Pending',
    ON_PROCESS = 'On Process',
    REVIEW = 'Review',
    COMPLETE = 'Complete',
}

export enum PriorityLevels {
    LOWEST = 'Lowest',
    LOW = 'Low',
    MEDIUM = 'Medium',
    HIGH = 'High',
    HIGHEST = 'Highest',
}

// Interfaces
export interface Creator {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string | null;
    gender: string;
    employmentType: string;
    joinDate: string;
    lastDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Assignee extends Creator { }

export interface TaskAssign {
    id: string;
    assignee: Assignee;
    unassignedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface FileMetadata {
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

export interface TaskDoc {
    id: string;
    file: FileMetadata;
    createdAt: string;
    updatedAt: string;
}

export interface ExtendedDeadline {
    id: string;
    deadline: string;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    parent: Task | null;
    children: Task[];
    idea: any | null;
    creator: Creator;
    title: string;
    description: string | null;
    deadline: string;
    extendedDeadlines: ExtendedDeadline[];
    priority: PriorityLevels;
    status: TaskStatus;
    completedAt: string | null;
    isField: boolean;
    deletedAt: string | null;
    assigns: TaskAssign[];
    taskDocs: TaskDoc[];
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface TasksResponse {
    statusCode: number;
    tasks: Task[];
    meta: PaginationMeta;
}
