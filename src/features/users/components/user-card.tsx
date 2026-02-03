import { Profile } from "@/features/dashboard/profile/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building, IdCard, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserCardProps {
    user: Profile;
}

export function UserCard({ user }: UserCardProps) {
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-border/50 bg-card">
            <CardContent className="p-0">
                <div className="h-2 bg-primary/80" />
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <Badge
                            variant="secondary"
                            className={cn(
                                "uppercase text-[10px] font-bold tracking-wider",
                                user.status === "ACTIVE"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            {user.status}
                        </Badge>
                    </div>

                    <div className="space-y-1 mb-4">
                        <h3 className="font-bold text-lg leading-none">{user.name}</h3>
                        <p className="text-sm text-primary font-mono flex items-center gap-1.5 leading-none">
                            <IdCard className="h-3.5 w-3.5" />
                            {user.id}
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4 shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-4 w-4 shrink-0" />
                                <span className="truncate">{user.department}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Briefcase className="h-4 w-4 shrink-0" />
                                <span className="truncate">{user.employmentType}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
