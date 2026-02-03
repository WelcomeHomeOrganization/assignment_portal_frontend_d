"use client";
import {
    BellIcon,
    SearchIcon,
} from "@/components/ui/icons";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {logoutAction} from "@/services/auth.service";

interface DashboardHeaderProps {
    user?: {
        name: string;
        email: string;
        id: string;
    }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const initials = user?.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "AD";

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4 w-full md:w-1/3">
                {/* Spacer for the mobile menu button which is 'fixed' and absolute positions itself */}
                <div className="w-10 md:hidden shrink-0" />

                <div className="relative w-full max-w-sm hidden sm:block">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full pl-8 bg-background"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600" />
                </Button>

                <ModeToggle />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="" alt={user?.name || "User"} />
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "Admin User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email || "admin@newsoffice.com"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            New Team
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => logoutAction()}
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
