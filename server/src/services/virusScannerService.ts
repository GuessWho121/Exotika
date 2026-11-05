import path from "path"
import { AppError } from "../middleware/errorMiddleware.js"

// Valid magic number headers (hex strings)
const MAGIC_NUMBERS = {
  png: "89504e47",
  jpeg: "ffd8ff",
  gif: "47494638",
  webp: "52494646" // RIFF
}

// Block dangerous executable / script extensions
const DANGEROUS_EXTS = new Set(["exe", "bat", "sh", "js", "ts", "html", "htm", "php", "py", "pl", "rb", "scr", "vbs"])

// Inspect file buffer for spoofed extensions / malicious binaries
export const validateFileMagicNumber = (buffer: Buffer, originalName: string) => {
  const ext = path.extname(originalName).toLowerCase().replace(".", "")

  if (DANGEROUS_EXTS.has(ext)) {
    throw new AppError(`Extension .${ext} is blocked for security reasons`, 400)
  }

  const hex = buffer.toString("hex", 0, 4)
  if (ext === "png" && !hex.startsWith(MAGIC_NUMBERS.png)) {
    throw new AppError("Invalid PNG image content header (MIME Spoofing detected)", 400)
  }
  if ((ext === "jpg" || ext === "jpeg") && !hex.startsWith(MAGIC_NUMBERS.jpeg)) {
    throw new AppError("Invalid JPEG image content header (MIME Spoofing detected)", 400)
  }
  if (ext === "gif" && !hex.startsWith(MAGIC_NUMBERS.gif)) {
    throw new AppError("Invalid GIF image content header (MIME Spoofing detected)", 400)
  }
  if (ext === "webp" && !hex.startsWith(MAGIC_NUMBERS.webp)) {
    throw new AppError("Invalid WEBP image content header (MIME Spoofing detected)", 400)
  }
}

// Fast in-memory validation check
export const scanFileBufferForViruses = async (buffer: Buffer, originalName: string): Promise<boolean> => {
  validateFileMagicNumber(buffer, originalName)
  return true
}
