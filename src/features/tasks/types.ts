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
    user?: {
        id: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Assignee extends Creator {
}

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

export interface Submitter {
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
    user: {
        id: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface TaskSubmissionNote {
    id: string;
    note: string;
    actor: Creator;
    files?: TaskDoc[];
    createdAt: string;
    updatedAt: string;
}

export interface TaskSubmission {
    id: string;
    submitter: Submitter;
    reviewer: Submitter | null;
    title: string;
    description: string | null;
    deletedAt: string | null;
    notes: TaskSubmissionNote[];
    submissionDocs: TaskDoc[];
    status: 'pending' | 'approved' | 'rejected';
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
    submissions: TaskSubmission[];
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

export interface UpdateTaskData {
    title?: string;
    description?: string | null;
    priority?: PriorityLevels;
    status?: TaskStatus;
    parentId?: string | null;
    ideaId?: string | null;
    assignedTo?: string[] | null;
    fileIds?: string[];
}

export interface TaskSubmissionData {
    taskId: string;
    title: string;
    description?: string;
    fileIds?: string[];
    finalSubmit?: boolean;
}
