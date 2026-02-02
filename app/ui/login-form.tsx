import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../components/ui/input";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Button } from "../components/ui/button";

export function LoginForm() {
    return (
        <div className="w-full max-w-100 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Admin Secure Login
                </h1>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Enter your credentials to manage the newsroom.
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            placeholder="admin@newsoffice.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            className="pl-10 bg-secondary/50 border-border/50"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            className="pl-10 bg-secondary/50 border-border/50"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                        >
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Remember Me</Label>
                    </div>
                    <Link
                        href="#"
                        className="ml-auto inline-block text-sm text-primary underline-offset-4 hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>
                <Button className="w-full h-11 text-base">
                    Sign In to News Desk
                </Button>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground tracking-widest uppercase mt-4">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Secure 256-bit Encrypted Connection
            </div>
        </div>
    )
}
