
import type { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import { pool } from "../db.js";

const COOKIE_NAME = "propmatch_session";

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

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const token = getSessionToken(req.headers.cookie);

    if (!token) {
        res.status(401).json({
            message: "Please log in first",
        });
        return;
    }

    try {
        const tokenHash = createHash("sha256")
            .update(token)
            .digest("hex");

        const result = await pool.query<{ user_id: number }>(
            `
            SELECT user_id
            FROM sessions
            WHERE token_hash = $1
              AND expires_at > NOW()
            `,
            [tokenHash]
        );

        const session = result.rows[0];

        if (!session) {
            res.status(401).json({
                message: "Session invalid or expired",
            });
            return;
        }

        // Make the authenticated user available to the route.
        res.locals.userId = session.user_id;

        next();
    } catch (error) {
        console.error("Authentication failed:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
}
