import express from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mini PropMatch API running" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});