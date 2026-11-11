
import "dotenv/config";
import express from "express";
import { propertyRouter } from "./routes/properties.js";
import { authRouter } from "./routes/auth.js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "16kb" }));

app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);

app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        message: "Mini PropMatch API running",
    });
});

app.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});
