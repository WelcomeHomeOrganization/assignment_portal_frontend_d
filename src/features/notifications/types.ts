export interface NotificationPayload {
    ideaId?: string;
    taskId?: string;
    [key: string]: any;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    payload: NotificationPayload;
    idempotencyKey?: string;
    isRead: boolean;
    createdAt: string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface NotificationResponse {
    notifications: Notification[];
    meta: PaginationMeta;
}
