import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${file.fieldname}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    cb(null, uniqueName);
  },
});

// Allowed mime types
const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    cb(new Error("Only JPG, PNG and PDF files are allowed"), false);
  } else {
    cb(null, true);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

export default upload;
