
import "dotenv/config";

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { pool } from "./db.js";

async function main() {
    const directory = resolve(process.cwd(), "migrations");

    const files = (await readdir(directory))
        .filter((file) => /^\d+_.+\.sql$/.test(file))
        .sort();

    const expectedFiles = [
        "001_create_users.sql",
        "002_create_sessions.sql",
        "003_create_properties.sql",
        "004_add_property_owner.sql",
    ];

    if (
        files.length !== expectedFiles.length ||
        files.some((file, index) => file !== expectedFiles[index])
    ) {
        throw new Error("Unexpected migration files. Baseline cancelled.");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Ensure this database contains the expected tables and columns.
        const result = await client.query<{
            users_exists: boolean;
            sessions_exists: boolean;
            properties_exists: boolean;
            owner_column_exists: boolean;
        }>(`
            SELECT
                to_regclass('public.users') IS NOT NULL AS users_exists,
                to_regclass('public.sessions') IS NOT NULL AS sessions_exists,
                to_regclass('public.properties') IS NOT NULL AS properties_exists,
                EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'properties'
                      AND column_name = 'owner_id'
                ) AS owner_column_exists
        `);

        const schema = result.rows[0];

        if (
            !schema?.users_exists ||
            !schema.sessions_exists ||
            !schema.properties_exists ||
            !schema.owner_column_exists
        ) {
            throw new Error(
                "Expected database structure is missing. Baseline cancelled."
            );
        }

        const completed = await client.query(
            "SELECT filename FROM schema_migrations"
        );

        if (completed.rows.length > 0) {
            throw new Error(
                "Migration history is not empty. Baseline cancelled."
            );
        }

        for (const file of files) {
            const sql = await readFile(
                resolve(directory, file),
                "utf8"
            );

            const checksum = createHash("sha256")
                .update(sql)
                .digest("hex");

            await client.query(
                `INSERT INTO schema_migrations
                    (filename, checksum)
                 VALUES ($1, $2)`,
                [file, checksum]
            );

            console.log(`Baselined ${file}`);
        }

        await client.query("COMMIT");

        console.log("Baseline completed successfully.");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

main()
    .catch((error) => {
        console.error("Baseline failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
