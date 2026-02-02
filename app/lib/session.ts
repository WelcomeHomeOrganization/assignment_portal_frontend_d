import "server-only";
import {EncryptJWT, SignJWT, jwtDecrypt, jwtVerify} from "jose";
import {cookies} from "next/headers";

export interface SessionPayload {
    accessToken: string;
    refreshToken: string;
    user: {
        name: string;
        email: string;
        id: string;
    };
}


const secretKey = process.env.SESSION_SECRET || "Z3Q6cG+7wV0Zk0vZQ6KZ6bZf+T1lP3ZJ4D7L1zR8C2M=";
// const encodedKey = new TextEncoder().encode(secretKey);
const encodedKey = Buffer.from(secretKey, "base64");

// export async function encrypt(payload: any) {
//     return new SignJWT(payload)
//         .setProtectedHeader({ alg: "HS256" })
//         .setIssuedAt()
//         .setExpirationTime("7d")
//         .sign(encodedKey);
// }

export async function encrypt(payload: SessionPayload) {
    return await new EncryptJWT(payload as any)
        .setProtectedHeader({alg: "dir", enc: "A256GCM"})
        .setIssuedAt()
        .setExpirationTime("7d")
        .encrypt(encodedKey);
}


// export async function decrypt(session: string | undefined = ""): Promise<SessionPayload | null> {
//     try {
//         const { payload } = await jwtVerify(session, encodedKey, {
//             algorithms: ["HS256"],
//         });
//         return payload as unknown as SessionPayload;
//     } catch (error) {
//         return null;
//     }
// }

export async function decrypt(
    session: string | undefined
): Promise<SessionPayload | null> {
    if (!session) return null;

    try {
        const {payload} = await jwtDecrypt(session, encodedKey);
        return payload as any;
    } catch {
        return null;
    }
}

export async function createSession(accessToken: string, refreshToken: string, user: any) {
    // Encrypt the tokens before storing them in the cookie
    // We can store them individually or as a single session object
    // Here we store them as a single session token for simplicity and atomicity
    const session = await encrypt({accessToken, refreshToken, user});
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
