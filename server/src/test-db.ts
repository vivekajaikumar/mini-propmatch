
import { pool } from "./db.js";

async function main() {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database_name, NOW() AS server_time"
        );

        console.log("Connected to Neon PostgreSQL!");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

main();
