import { Profile } from "@/features/dashboard/profile/types";
import { UserCard } from "./user-card";

interface UserListProps {
    users: Profile[];
}

export function UserList({ users }: UserListProps) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </div>
    );
}
