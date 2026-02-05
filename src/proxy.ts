import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/session";

// Define protected routes
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/", "/signup", "/server-error"];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 1. Get the session cookie
    const sessionCookie = req.cookies.get("session")?.value;
    const session = await decrypt(sessionCookie);

    // 2. Redirect if accessing protected route without session
    if (isProtectedRoute && !session?.accessToken) {
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 3. Redirect to dashboard if logged in and accessing public route
    if (isPublicRoute && session?.accessToken) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    // 4. Verify Token with Backend if processing a protected route
    if (isProtectedRoute && session?.accessToken) {
        try {
            const verifyRes = await fetch(`${process.env.BACKEND_LINK}/auth/verify`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${session.accessToken}`
                }
            });

            if (verifyRes.ok) {
                return NextResponse.next();
            }

            // 5. Token Expired/Invalid -> Try Refresh
            if (verifyRes.status === 401 && session.refreshToken) {
                try {
                    const refreshRes = await fetch(`${process.env.BACKEND_LINK}/auth/refresh`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refresh_token: session.refreshToken })
                    });

                    if (refreshRes.ok) {
                        const data = await refreshRes.json();
                        const newAccessToken = data.access_token;
                        // If backend sends a new refresh token, use it. Otherwise, keep old one?
                        // Assume we keep old one if not provided, but spec says response has access_token. 
                        // Wait, spec said: { access_token: string }.
                        // Let's reuse existing refresh token if not provided.

                        const newSessionPayload = {
                            accessToken: newAccessToken,
                            refreshToken: data.refresh_token || session.refreshToken,
                            user: data.user
                        };

                        // We need to update the cookie. 
                        // Since we are in Middleware, we can't easily use "createSession" from lib because it uses `cookies()` helper which is read-only in some contexts or tricky.
                        // But `createSession` uses `cookies().set(...)` which works in Server Actions. In Middleware, we must set response cookies.

                        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                        const newSessionToken = await encrypt(newSessionPayload);

                        const response = NextResponse.next();
                        response.cookies.set("session", newSessionToken, {
                            httpOnly: true,
                            secure: true,
                            expires: expiresAt,
                            sameSite: "lax",
                            path: "/",
                        });

                        return response;
                    }
                } catch (err) {
                    console.error("Refresh failed", err);
                }
            }

            // If refresh failed or invalid -> Logout (Redirect to log in)
            const response = NextResponse.redirect(new URL("/login", req.nextUrl));
            response.cookies.delete("session");
            return response;
        } catch (error) {
            // Backend server is not running or network error
            console.error("Backend server connection failed:", error);

            // Redirect to server error page
            const response = NextResponse.redirect(new URL("/server-error", req.nextUrl));
            // response.cookies.delete("session");
            return response;
        }
    }

    return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
