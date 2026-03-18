import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import warrantyRoutes from "./routes/warrantyRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import formConfigRoutes from "./routes/formConfigRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://10.255.100.199:3000",
];

// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) or whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // 🔑 allow cookies & authorization headers
}));

app.use(express.json());

// ✅ Serve uploaded files as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use("/api/warranty", warrantyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/form", formConfigRoutes);

// ✅ Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy 🚀" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
