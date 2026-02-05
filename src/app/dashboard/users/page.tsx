import { getUsers } from "@/services/user.service";
import { UserTable } from "@/features/users/components/user-list";
import { UsersIcon } from "@/components/ui/icons";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateUserModalWrapper } from "@/features/users/components/create-user-modal-wrapper";

interface UsersPageProps {
    searchParams: Promise<{ page?: string }>;
}

async function UsersTableContent({ page }: { page: number }) {
    const { users, meta } = await getUsers(page);

    return <UserTable users={users} meta={meta} />;
}

function UsersTableSkeleton() {
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

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const params = await searchParams;
    const page = Number(params.page) || 1;

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary">
                        <UsersIcon className="h-6 w-6" />
                        <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Manage and view all registered users in the NewsOffice Pro system.
                    </p>
                </div>
                <CreateUserModalWrapper />
            </div>

            <Suspense key={page} fallback={<UsersTableSkeleton />}>
                <UsersTableContent page={page} />
            </Suspense>
        </div>
    );
}
