
import "dotenv/config";

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { pool } from "./db.js";

const migrationsDirectory = resolve(
    process.cwd(),
    "migrations"
);

async function main() {
    const client = await pool.connect();

    try {
        // Create a table that remembers completed migrations.
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename TEXT PRIMARY KEY,
                checksum TEXT NOT NULL,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        const files = (await readdir(migrationsDirectory))
            .filter((file) => /^\d+_.+\.sql$/.test(file))
            .sort();

        const completed = await client.query<{
            filename: string;
            checksum: string;
        }>(
            "SELECT filename, checksum FROM schema_migrations"
        );

        const applied = new Map(
            completed.rows.map((row) => [
                row.filename,
                row.checksum,
            ])
        );

        // Prevent automatic replay against an existing database
        // that has never used our migration system.
        if (applied.size === 0) {
            const result = await client.query<{
                users_exists: boolean;
                sessions_exists: boolean;
                properties_exists: boolean;
            }>(`
                SELECT
                    to_regclass('public.users') IS NOT NULL
                        AS users_exists,
                    to_regclass('public.sessions') IS NOT NULL
                        AS sessions_exists,
                    to_regclass('public.properties') IS NOT NULL
                        AS properties_exists
            `);

            const existing = result.rows[0];

            if (
                existing?.users_exists ||
                existing?.sessions_exists ||
                existing?.properties_exists
            ) {
                console.log(
                    "Existing application tables detected."
                );
                console.log(
                    "Migrations were not applied."
                );
                console.log(
                    "We must verify and baseline this database first."
                );
                return;
            }
        }

        for (const file of files) {
            const path = resolve(migrationsDirectory, file);
            const sql = await readFile(path, "utf8");

            const checksum = createHash("sha256")
                .update(sql)
                .digest("hex");

            if (applied.has(file)) {
                if (applied.get(file) !== checksum) {
                    throw new Error(
                        `Previously applied migration changed: ${file}`
                    );
                }

                console.log(`Skipping ${file}`);
                continue;
            }

            console.log(`Applying ${file}...`);

            await client.query("BEGIN");

            try {
                await client.query(sql);

                await client.query(
                    `INSERT INTO schema_migrations
                        (filename, checksum)
                     VALUES ($1, $2)`,
                    [file, checksum]
                );

                await client.query("COMMIT");

                console.log(`Applied ${file}`);
            } catch (error) {
                await client.query("ROLLBACK");
                throw error;
            }
        }

        console.log("Database migrations complete.");
    } finally {
        client.release();
    }
}

main()
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
