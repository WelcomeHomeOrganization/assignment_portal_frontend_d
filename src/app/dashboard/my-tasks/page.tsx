import { getMyAssignedTasks } from "@/services/task.service";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { TaskIcon } from "@/components/ui/icons";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface MyTasksPageProps {
    searchParams: Promise<{ page?: string }>;
}

async function MyTasksTableContent({ page }: { page: number }) {
    const { tasks, meta } = await getMyAssignedTasks(page);

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

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <TaskIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Tasks that have been assigned to you.
                    </p>
                </div>
            </div>

            <Suspense key={page} fallback={<TasksTableSkeleton />}>
                <MyTasksTableContent page={page} />
            </Suspense>
        </div>
    );
}
