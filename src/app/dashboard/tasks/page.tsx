import { getTasks } from "@/services/task.service";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { TaskIcon } from "@/components/ui/icons";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";

interface TasksPageProps {
    searchParams: Promise<{ page?: string }>;
}

async function TasksTableContent({ page }: { page: number }) {
    const { tasks, meta } = await getTasks(page);

    return <TasksTable tasks={tasks} meta={meta} />;
}

function TasksTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <div className="p-4 space-y-4">
                    <Skeleton className="h-10 w-full" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <TaskIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    </div>
                    <p className="text-muted-foreground">
                        View and manage all tasks in the system.
                    </p>
                </div>
                <CreateTaskModal />
            </div>

            <Suspense key={page} fallback={<TasksTableSkeleton />}>
                <TasksTableContent page={page} />
            </Suspense>
        </div>
    );
}
