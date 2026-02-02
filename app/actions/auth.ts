"use server";

interface LoginState {
    message: string;
    error?: {
        email?: string[];
        password?: string[];
    };
    success?: boolean;
}

export async function loginAction(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const baseUrl = process.env.BACKEND_LINK;

    if (!baseUrl) {
        return {message: "Auth API URL not configured", success: false};
    }

    try {
        const response = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password}),
        });

        const data = await response.json();
        console.log("Response : ", data);
        if (!response.ok) {
            return {
                message: data?.message ?? "Invalid credentials",
                success: false,
            };
        }

        return {message: "Login successful", success: true};
    } catch (error) {
        console.error("Login error:", error);
        return {message: "Failed to connect to server", success: false};
    }
}
