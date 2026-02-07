"use client";

import { Task, TaskStatus, PriorityLevels } from "@/features/tasks/types";
import { Badge } from "@/components/ui/badge";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Users, CornerDownRight } from "lucide-react";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


interface TasksTableProps {
    tasks: Task[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Helper function to get status badge color
const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
        case TaskStatus.DRAFT:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
        case TaskStatus.PENDING:
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case TaskStatus.ON_PROCESS:
            return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        case TaskStatus.REVIEW:
            return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
        case TaskStatus.COMPLETE:
            return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        default:
            return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    }
};

// Helper function to get priority badge color
const getPriorityColor = (priority: PriorityLevels): string => {
    switch (priority) {
        case PriorityLevels.LOWEST:
            return "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400";
        case PriorityLevels.LOW:
            return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
        case PriorityLevels.MEDIUM:
            return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case PriorityLevels.HIGH:
            return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
        case PriorityLevels.HIGHEST:
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400";
    }
};

export function TasksTable({ tasks, meta }: TasksTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const getSerialNumber = (index: number) => {
        return (meta.page - 1) * meta.limit + index + 1;
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`?${params.toString()}`);
    };

    const formatDeadline = (task: Task) => {
        // Use the last extended deadline if it exists, otherwise use the original deadline
        let deadlineToUse = task.deadline;

        if (task.extendedDeadlines && task.extendedDeadlines.length > 0) {
            // Get the last extended deadline
            const lastExtendedDeadline = task.extendedDeadlines[task.extendedDeadlines.length - 1];
            deadlineToUse = lastExtendedDeadline.deadline;
        }

        const date = new Date(deadlineToUse);
        const now = new Date();
        const isOverdue = date < now;

        return (
            <span className={cn(isOverdue && "text-red-600 font-semibold")}>
                {date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                })}
            </span>
        );
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-4">
                    <span className="text-4xl text-muted-foreground">📋</span>
                </div>
                <h3 className="text-xl font-bold">No tasks found</h3>
                <p className="text-muted-foreground">The task list is currently empty.</p>
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
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Deadline</TableHead>
                            <TableHead>Assignees</TableHead>
                            <TableHead>Creator</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TooltipProvider>
                            {tasks.map((task, index) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">
                                        {getSerialNumber(index)}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {task.parent && (
                                                <div className="flex items-center gap-1">
                                                    <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[9px] px-1 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                                    >
                                                        SUB
                                                    </Badge>
                                                </div>
                                            )}
                                            <span>{task.title}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] font-bold tracking-wider",
                                                getStatusColor(task.status)
                                            )}
                                        >
                                            {task.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] font-bold tracking-wider",
                                                getPriorityColor(task.priority)
                                            )}
                                        >
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDeadline(task)}
                                    </TableCell>
                                    <TableCell>
                                        {task.assigns.length > 0 ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1 cursor-help">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">
                                                            {task.assigns.length}
                                                        </span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="space-y-1">
                                                        {task.assigns.map((assign) => (
                                                            <p key={assign.id} className="text-sm">
                                                                {assign.assignee.firstName} {assign.assignee.lastName}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="font-mono text-sm text-primary cursor-help underline decoration-dotted">
                                                    {task.creator.staffId}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">
                                                    {task.creator.firstName} {task.creator.lastName}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                asChild
                                            >
                                                <Link href={`/dashboard/tasks/${task.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TooltipProvider>
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} tasks
                </p>
                {meta.totalPages > 1 && (
                    <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </div>
    );
}
