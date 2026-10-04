import { v2 as cloudinary } from "cloudinary";
import { Router } from "express";
import multer from "multer";
import { HttpError, badRequest } from "../../lib/http-error.js";

const router = Router();
const FOLDER = "cyber-shop/products";

// Files stay in memory and go straight to Cloudinary; nothing is written to Render's disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: FOLDER }, (err, result) => (err ? reject(err) : resolve(result))).end(buffer);
  });

// POST /api/admin/uploads (multipart, field "image") -> { url, publicId }
router.post("/", (req, res, next) => {
  if (!process.env.CLOUDINARY_URL) {
    throw new HttpError(503, "Image uploads aren't set up yet: add CLOUDINARY_URL to the API's environment.");
  }
  upload.single("image")(req, res, async (err) => {
    try {
      if (err?.code === "LIMIT_FILE_SIZE") throw badRequest("Images can be at most 8 MB");
      if (err) throw err;
      if (!req.file) throw badRequest("Choose an image file (JPG, PNG or WebP)");
      const result = await uploadBuffer(req.file.buffer);
      // Same delivery settings as scripts/upload-images.js: capped size, best format and quality per browser.
      const url = cloudinary.url(result.public_id, {
        secure: true,
        transformation: [{ width: 1000, crop: "limit" }, { fetch_format: "auto", quality: "auto" }],
      });
      res.status(201).json({ url, publicId: result.public_id });
    } catch (e) {
      next(e);
    }
  });
});

export default router;
