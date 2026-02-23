"use client";

import { useState, useEffect, useCallback } from "react";
import { BellIcon, CheckIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/services/notification.service";
import { Notification } from "@/features/notifications/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { useSocket } from "@/hooks/use-socket";

// Utility to format relative time
function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
}

interface NotificationDropdownProps {
    employeeId?: string;
}

export function NotificationDropdown({ employeeId }: NotificationDropdownProps) {
    const { socket } = useSocket(employeeId);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await getNotifications(1, 20);
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle WebSocket events
    useEffect(() => {
        
        if (!socket) return;

        const handleNewNotification = (data: any) => {
            console.log("WebSocket received event 'notifications':", data);

            // Handle both single notification object and array of notifications
            if (Array.isArray(data)) {
                // If the backend sends the full list, you might want to replace the list completely
                // or just prepend the new ones. Assuming it's a single new item typically,
                // but let's handle it just in case:
                setNotifications(prev => {
                    const newItems = data.filter(d => !prev.some(p => p.id === d.id));
                    return [...newItems, ...prev];
                });
                setUnreadCount(prev => prev + data.filter((n: any) => !n.isRead).length);
            } else {
                setNotifications(prev => [data, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast("New Notification", { description: data.title || "You have a new notification" });
            }
        };

        // Listen on BOTH possible event names just to be safe during debugging
        socket.on("notifications", handleNewNotification);
        socket.on("new_notification", handleNewNotification);

        return () => {
            socket.off("notifications", handleNewNotification);
            socket.off("new_notification", handleNewNotification);
        };
    }, [socket]);

    const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();

        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        const success = await markNotificationAsRead(id);
        if (!success) {
            // Revert on failure
            fetchNotifications();
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        const success = await markAllNotificationsAsRead();
        if (!success) {
            // Revert on failure
            fetchNotifications();
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // 1. Mark as read if it isn't already
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }

        // 2. Navigate based on type
        setIsOpen(false);
        if (notification.type === "NEW_IDEA" && notification.payload?.ideaId) {
            // Can navigate to my-ideas or a specific idea page if it exists
            // router.push(`/dashboard/ideas/${notification.payload.ideaId}`);
            router.push(`/dashboard/ideas`);
        } else if (notification.type === "NEW_TASK" && notification.payload?.taskId) {
            // router.push(`/dashboard/tasks/${notification.payload.taskId}`);
            router.push(`/dashboard/tasks`);
        } else {
            // Fallback navigation
            router.push(`/dashboard`);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 border-2 border-background" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <DropdownMenuLabel className="p-0 font-semibold text-base">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllAsRead}
                        >
                            <CheckIcon className="mr-1 h-3 w-3" />
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
                            <BellIcon className="h-8 w-8 mb-3 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "flex flex-col gap-1 p-4 border-b last:border-0 cursor-pointer transition-colors hover:bg-muted/50",
                                        !notification.isRead && "bg-primary/5"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            )}
                                            <span className={cn(
                                                "text-sm font-medium",
                                                !notification.isRead ? "text-foreground" : "text-muted-foreground"
                                            )}>
                                                {notification.title}
                                            </span>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                                            {formatRelativeTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p className={cn(
                                        "text-sm",
                                        !notification.isRead ? "text-foreground/90 font-medium" : "text-muted-foreground"
                                    )}>
                                        {notification.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Button variant="ghost" className="w-full text-xs" onClick={() => setIsOpen(false)}>
                            Close
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
