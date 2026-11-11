
import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { pool } from "../db.js";
import { randomBytes, createHash } from "node:crypto";

export const authRouter = Router();

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = "propmatch_session";

const signupSchema = z.object({
    email: z
        .email()
        .trim()
        .toLowerCase()
        .max(255),

    password: z
        .string()
        .min(12, "Password must be at least 12 characters")
        .max(128, "Password is too long"),
});

const loginSchema = z.object({
    email: z
        .email()
        .trim()
        .toLowerCase(),

    password: z.string(),
});

type PublicUser = {
    id: number;
    email: string;
};

type StoredUser = PublicUser & {
    password_hash: string;
};

function hashToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

function getSessionToken(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;

    const cookie = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${COOKIE_NAME}=`));

    if (!cookie) return null;

    const token = cookie.slice(COOKIE_NAME.length + 1);

    return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

// POST /api/auth/signup
authRouter.post("/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid signup details",
            errors: z.flattenError(parsed.error),
        });
        return;
    }

    const { email, password } = parsed.data;

    try {
        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1,
        });

        const result = await pool.query<PublicUser>(
            `
                INSERT INTO users (email, password_hash)
                VALUES ($1, $2)
                    RETURNING id, email
            `,
            [email, passwordHash]
        );

        res.status(201).json({
            message: "Account created successfully",
            user: result.rows[0],
        });
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505"
        ) {
            res.status(409).json({
                message: "Email is already registered",
            });
            return;
        }

        console.error("Signup failed:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            message: "Invalid login details",
        });
        return;
    }

    const { email, password } = parsed.data;

    try {
        const result = await pool.query<StoredUser>(
            `
                SELECT id, email, password_hash
                FROM users
                WHERE email = $1
            `,
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const isValid = await argon2.verify(
            user.password_hash,
            password
        );

        if (!isValid) {
            res.status(401).json({
                message: "Invalid email or password",
            });
            return;
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = hashToken(token);

        const expiresAt = new Date(
            Date.now() + SESSION_DURATION_MS
        );

        await pool.query(
            `
                INSERT INTO sessions (
                    user_id,
                    token_hash,
                    expires_at
                )
                VALUES ($1, $2, $3)
            `,
            [user.id, tokenHash, expiresAt]
        );

        res.cookie(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_DURATION_MS,
        });

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login failed:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// POST /api/auth/logout
authRouter.post("/logout", async (req, res) => {
    const token = getSessionToken(req.headers.cookie);

    try {
        if (token) {
            await pool.query(
                `
                    DELETE FROM sessions
                    WHERE token_hash = $1
                `,
                [hashToken(token)]
            );
        }

        res.clearCookie(COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        res.json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout failed:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// GET /api/auth/me
authRouter.get("/me", async (req, res) => {
    const token = getSessionToken(req.headers.cookie);

    // No cookie means the user is not logged in.
    if (!token) {
        res.status(401).json({
            message: "Not authenticated",
        });
        return;
    }

    try {
        const tokenHash = hashToken(token);

        const result = await pool.query<PublicUser>(
            `
            SELECT
                users.id,
                users.email
            FROM sessions
            JOIN users
                ON users.id = sessions.user_id
            WHERE sessions.token_hash = $1
              AND sessions.expires_at > NOW()
            `,
            [tokenHash]
        );

        const user = result.rows[0];

        if (!user) {
            res.status(401).json({
                message: "Session invalid or expired",
            });
            return;
        }

        res.status(200).json({
            user,
        });
    } catch (error) {
        console.error("Session verification failed:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});
