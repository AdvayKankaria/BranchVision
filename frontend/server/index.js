import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/upload.js";
import submitApplicationRoutes from "./routes/submitApplication.js";
import authRoutes from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/upload", uploadRoutes); // Re-added 'req'
app.use("/api/submit-application", submitApplicationRoutes);
app.use("/api/auth", authRoutes);

// Fallback to index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

router.get("/example-route", (_, res) => {
  // Removed unused 'req'
  res.send("Example response");
});

app.get("/api/some-endpoint", (res) => {
  // ...existing code...
});
