import "server-only";
import {SignJWT, jwtVerify} from "jose";
import {cookies} from "next/headers";

const secretKey = process.env.SESSION_SECRET || "default_secret_key_change_me_in_production";
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({alg: "HS256"})
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
    try {
        const {payload} = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function createSession(accessToken: string, refreshToken: string) {
    // Encrypt the tokens before storing them in the cookie
    // We can store them individually or as a single session object
    // Here we store them as a single session token for simplicity and atomicity
    const session = await encrypt({accessToken, refreshToken});
    const cookieStore = await cookies();

    cookieStore.set("session", session, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        sameSite: "lax",
        path: "/",
    });
}

export async function deleteSession() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}
