import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads");
const allowedImageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (
    !allowedImageMimeTypes.has(file.mimetype) ||
    !allowedImageExtensions.has(extension)
  ) {
    cb(new Error("Only image files are allowed."));
    return;
  }

  cb(null, true);
};

export const uploadProductImage = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const saveUploadedProductImage = async (
  file: Express.Multer.File
): Promise<string> => {
  await fs.promises.mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const outputPath = path.join(uploadDir, filename);

  try {
    await sharp(file.buffer, { failOn: "warning" })
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 86,
        mozjpeg: true,
      })
      .toFile(outputPath);
  } catch {
    throw new Error("Uploaded image is invalid.");
  }

  return `/uploads/${filename}`;
};

export const deleteUploadedProductImage = async (
  imageUrl?: string | null
) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
    return;
  }

  const filename = path.basename(imageUrl);
  const targetPath = path.resolve(uploadDir, filename);
  const uploadRoot = path.resolve(uploadDir);

  if (!targetPath.startsWith(uploadRoot)) {
    return;
  }

  try {
    await fs.promises.unlink(targetPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to delete uploaded image:", error);
    }
  }
};
