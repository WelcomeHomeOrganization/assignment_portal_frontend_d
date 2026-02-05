"use server";

import { createSession, deleteSession, decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

interface LoginState {
    message: string;
    error?: {
        email?: string[];
        password?: string[];
    };
    success?: boolean;
}

export async function logoutAction() {
    try {
        // Get session tokens before deleting
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("session")?.value;

        if (sessionCookie) {
            const session = await decrypt(sessionCookie);

            if (session?.accessToken && session?.refreshToken) {
                // Call backend logout API
                const baseUrl = process.env.BACKEND_LINK;

                if (baseUrl) {
                    try {
                        await fetch(`${baseUrl}/auth/logout`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${session.accessToken}`
                            },
                            body: JSON.stringify({
                                refresh_token: session.refreshToken
                            })
                        });
                    } catch (error) {
                        console.error("Backend logout failed:", error);
                        // Continue with session deletion even if backend call fails
                    }
                }
            }
        }
    } catch (error) {
        console.error("Logout error:", error);
    }

    // Always delete the session cookie
    await deleteSession();
    redirect("/");
}

export async function loginAction(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email: string = formData.get("email") as string;
    const password = formData.get("password") as string;

    const baseUrl = process.env.BACKEND_LINK;

    if (!baseUrl) {
        return { message: "Auth API URL not configured", success: false };
    }

    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            return {
                message: data?.message ?? "Invalid credentials",
                success: false,
            };
        }

        if (data.tokens?.access_token && data.tokens?.refresh_token) {
            await createSession(data.tokens.access_token, data.tokens.refresh_token, data.user);
        } else {
            return { message: "Login failed: Missing tokens", success: false };
        }

    } catch (error) {
        console.error("Login error:", error);
        return { message: "Failed to connect to server", success: false };
    }

    redirect("/dashboard");
}
