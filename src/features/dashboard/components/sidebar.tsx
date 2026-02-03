'use client';

import React, { useState } from 'react';
import {
    DashboardIcon,
    PermissionIcon,
    TaskIcon,
    TeamIcon,
    MenuIcon,
    CloseIcon,
    EmployeeIcon, UsersIcon
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NavItem } from "./nav-item";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Toggle Button (Floating or integrated into header) */}
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-3 left-4 z-50 h-10 w-10"
                onClick={toggleSidebar}
            >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
            </Button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-border flex flex-col p-6 bg-muted/40 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center gap-2 mb-10 pl-10 md:pl-0">
                    <div className="bg-primary p-2 rounded-lg text-primary-foreground">📰</div>
                    <h1 className="font-bold text-lg">NewsOffice Pro</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem href="/dashboard" icon={DashboardIcon} label="Dashboard" />
                    <NavItem href="/dashboard/team" icon={TeamIcon} label="Team" />
                    <NavItem href="/dashboard/tasks" icon={TaskIcon} label="Tasks" />
                    <NavItem href="/dashboard/permissions" icon={PermissionIcon} label="Permissions" />
                    <NavItem href="/dashboard/users" icon={UsersIcon} label="Users" />
                </nav>

                <Button className="w-full mt-auto">
                    + New Story
                </Button>
            </aside>
        </>
    );
}
