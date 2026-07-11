import multer from "multer"
import { AppError } from "./errorMiddleware.js"

// Configure in-memory storage buffer
const storage = multer.memoryStorage()

// Check image extensions and mime types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"]
  const allowedExtensions = ["jpg", "jpeg", "png", "webp"]
  
  const extension = file.originalname.split(".").pop()?.toLowerCase() || ""
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
    cb(null, true)
  } else {
    cb(new AppError("Invalid file type. Only JPEG, PNG, and WebP images are allowed.", 400))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})
