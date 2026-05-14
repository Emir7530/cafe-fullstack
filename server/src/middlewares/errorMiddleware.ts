import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5MB or smaller."
        : err.message;

    return res.status(400).json({ message });
  }

  if (err instanceof Error && err.message === "Only image files are allowed.") {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({
    message: err instanceof Error ? err.message : "Something went wrong",
  });
};
