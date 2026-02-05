"use client";

import { useState } from "react";
import { User } from "@/features/users/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { useRouter, useSearchParams } from "next/navigation";
import { UpdateUserModal } from "./update-user-modal";
import { Pencil } from "lucide-react";

interface UserTableProps {
    users: User[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export function UserTable({ users, meta }: UserTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);

    // Calculate serial number based on page and limit
    const getSerialNumber = (index: number) => {
        return (meta.page - 1) * meta.limit + index + 1;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setUpdateModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        router.refresh();
    };

    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                    <span className="text-4xl text-muted-foreground">👥</span>
                </div>
                <h3 className="text-xl font-bold">No users found</h3>
                <p className="text-muted-foreground">The user list is currently empty.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[60px]">S/N</TableHead>
                            <TableHead>Staff ID</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>User Status</TableHead>
                            <TableHead>Employee Status</TableHead>
                            <TableHead>Failed Attempts</TableHead>
                            <TableHead>Max Attempts</TableHead>
                            <TableHead>Locked Until</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {getSerialNumber(index)}
                                </TableCell>
                                <TableCell className="font-mono text-primary">
                                    {user.employee?.staffId || "N/A"}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "uppercase text-[10px] font-bold tracking-wider",
                                            user.status === "active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "uppercase text-[10px] font-bold tracking-wider",
                                            user.employee?.status === "active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        )}
                                    >
                                        {user.employee?.status || "N/A"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className={cn(
                                        "font-medium",
                                        user.failedAttemptCount > 0 && "text-orange-600 dark:text-orange-400"
                                    )}>
                                        {user.failedAttemptCount}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    {user.maxFailedAttempts}
                                </TableCell>
                                <TableCell>
                                    {user.lockedUntil ? (
                                        <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        >
                                            {new Date(user.lockedUntil).toLocaleString("en-US", {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </Badge>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
                </p>
                {meta.totalPages > 1 && (
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {selectedUser && (
                <UpdateUserModal
                    user={selectedUser}
                    open={updateModalOpen}
                    onOpenChange={setUpdateModalOpen}
                    onSuccess={handleUpdateSuccess}
                />
            )}
        </div>
    );
}
