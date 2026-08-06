import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import crypto from "crypto"
import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"
import { scanFileBufferForViruses } from "./virusScannerService.js"
import { AppError } from "../middleware/errorMiddleware.js"

const s3Client = new S3Client({
  endpoint: env.S3_ENDPOINT,
  region: "us-east-1", // AWS SDK requires region, placeholder for MinIO
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY
  },
  forcePathStyle: env.S3_FORCE_PATH_STYLE // true for MinIO compatibility
})

export const ensureBucketExists = async () => {
  let bucketExists = false
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME }))
    logger.info(`🪣 MinIO bucket '${env.AWS_S3_BUCKET_NAME}' checked successfully.`)
    bucketExists = true
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME }))
        logger.info(`🪣 MinIO bucket '${env.AWS_S3_BUCKET_NAME}' created successfully.`)
        bucketExists = true
      } catch (createError) {
        logger.error("❌ Failed to create MinIO bucket on boot:", createError)
      }
    } else {
      logger.error("❌ Head bucket operation failed:", error)
    }
  }
}

export const getFileStream = async (key: string): Promise<{ stream: any; contentType: string | undefined }> => {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key
    })
  )
  return {
    stream: response.Body,
    contentType: response.ContentType
  }
}

export const uploadFile = async (file: Express.Multer.File, folder?: string): Promise<string> => {
  const fileExtension = file.originalname.split(".").pop()
  const fileName = `${crypto.randomUUID()}.${fileExtension}`
  const key = folder ? `${folder}/${fileName}` : fileName

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  )

  return `/api/storage/${key}`
}

export const uploadBase64Image = async (base64Str: string, folder?: string): Promise<string> => {
  // Parse base64 string
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new AppError("Invalid base64 image string format", 400)
  }

  const contentType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  // Determine file extension and restrict to safe images
  let extension = ""
  if (contentType === "image/png") {
    extension = "png"
  } else if (contentType === "image/jpeg" || contentType === "image/jpg") {
    extension = "jpg"
  } else if (contentType === "image/webp") {
    extension = "webp"
  } else if (contentType === "image/gif") {
    extension = "gif"
  } else {
    throw new AppError("Invalid image content type. Only PNG, JPEG, WEBP, and GIF are allowed.", 400)
  }

  // Perform magic number validation and virus scanning
  await scanFileBufferForViruses(buffer, `image.${extension}`)

  const fileName = `${crypto.randomUUID()}.${extension}`
  const key = folder ? `${folder}/${fileName}` : fileName

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  )

  return `/api/storage/${key}`
}

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split("/")
    
    // Check if it's the new relative storage URL format (e.g. /api/storage/folder/file.png)
    const storageIndex = urlParts.indexOf("storage")
    let key = ""
    if (storageIndex !== -1 && storageIndex < urlParts.length - 1) {
      key = urlParts.slice(storageIndex + 1).join("/")
    } else {
      // Fallback for absolute legacy MinIO URLs
      const bucketIndex = urlParts.indexOf(env.AWS_S3_BUCKET_NAME)
      if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
        logger.warn(`Could not extract S3 object key from URL: ${fileUrl}`)
        return
      }
      key = urlParts.slice(bucketIndex + 1).join("/")
    }

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Key: key
      })
    )
    logger.info(`Object deleted from S3 storage: ${key}`)
  } catch (error: any) {
    logger.error(`Failed to delete S3 file: ${error.message}`)
  }
}
