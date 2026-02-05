"use client"

import { ModeToggle } from "@/components/ui/mode-toggle";
import { ServerCrash, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// export const metadata = {
//     title: "Server Error | News Office Management",
//     description: "Backend server is not responding",
// };

export default function ServerErrorPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="flex h-16 items-center justify-between border-b border-border/40 px-6 lg:px-40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center transform rotate-3">
                        <div className="h-4 w-4 bg-white rounded-sm" />
                    </div>
                    News Desk Admin
                </div>
                <ModeToggle />
            </header>
            <main className="flex grow flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-red-500/10 via-background to-background">
                <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-card text-card-foreground shadow-2xl p-8 pt-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mb-2">
                            <ServerCrash className="h-12 w-12 text-red-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Server Not Responding
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                The backend server is currently not running or unreachable. Please contact your system administrator to start the server.
                            </p>
                        </div>

                        <div className="w-full border-t border-border/40 my-4" />

                        <div className="space-y-3 w-full">
                            <p className="text-xs text-muted-foreground">
                                Possible reasons:
                            </p>
                            <ul className="text-xs text-muted-foreground text-left space-y-2 pl-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>Backend server is not running</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>Network connection issue</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>Server is temporarily unavailable</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex gap-3 w-full pt-4">
                            <Button
                                variant="outline"
                                className="flex-1"
                                asChild
                            >
                                <Link href="/">
                                    <Home className="mr-2 h-4 w-4" />
                                    Home
                                </Link>
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={() => window.location.reload()}
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retry
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="py-6 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} News Office Management System. Internal Use Only.
            </footer>
        </div>
    );
}
