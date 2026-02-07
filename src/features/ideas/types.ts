export interface Creator {
    id: string;
    staffId: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    gender: string;
    employmentType: string;
    joinDate: string;
    lastDate: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Idea {
    id: string;
    title: string;
    description: string;
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
