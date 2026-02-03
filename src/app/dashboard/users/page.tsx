import { getAllUsers } from "@/services/user.service";
import { UserList } from "@/features/users/components/user-list";
import { UsersIcon } from "@/components/ui/icons";

export default async function UsersPage() {
    const users = await getAllUsers();

    return (
        <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                    <UsersIcon className="h-6 w-6" />
                    <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
                </div>
                <p className="text-muted-foreground">
                    Manage and view all registered users in the NewsOffice Pro system.
                </p>
            </div>

            <UserList users={users} />
        </div>
    );
}
