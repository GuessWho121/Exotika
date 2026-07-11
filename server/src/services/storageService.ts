import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3"
import { env } from "../config/env.js"
import { logger } from "../utils/logger.js"

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

  if (bucketExists) {
    try {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}/*`]
          }
        ]
      }
      await s3Client.send(
        new PutBucketPolicyCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Policy: JSON.stringify(policy)
        })
      )
      logger.info(`🪣 MinIO bucket '${env.AWS_S3_BUCKET_NAME}' public read policy applied successfully.`)
    } catch (policyError) {
      logger.error("❌ Failed to set MinIO bucket policy:", policyError)
    }
  }
}

export const uploadFile = async (file: Express.Multer.File, folder?: string): Promise<string> => {
  const fileExtension = file.originalname.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`
  const key = folder ? `${folder}/${fileName}` : fileName

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    })
  )

  // Return url. The backend can translate this endpoint relative to the client host if needed.
  const baseUrl = env.S3_PUBLIC_URL || env.S3_ENDPOINT
  return `${baseUrl}/${env.AWS_S3_BUCKET_NAME}/${key}`
}

export const uploadBase64Image = async (base64Str: string, folder?: string): Promise<string> => {
  // Parse base64 string
  const matches = base64Str.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 image string format")
  }

  const contentType = matches[1]
  const base64Data = matches[2]
  const buffer = Buffer.from(base64Data, "base64")

  // Determine file extension
  let extension = "png"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    extension = "jpg"
  } else if (contentType.includes("webp")) {
    extension = "webp"
  } else if (contentType.includes("gif")) {
    extension = "gif"
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`
  const key = folder ? `${folder}/${fileName}` : fileName

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  )

  const baseUrl = env.S3_PUBLIC_URL || env.S3_ENDPOINT
  return `${baseUrl}/${env.AWS_S3_BUCKET_NAME}/${key}`
}

export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const urlParts = fileUrl.split("/")
    
    // Key could contain folders, so we need everything after the bucket name
    const bucketIndex = urlParts.indexOf(env.AWS_S3_BUCKET_NAME)
    if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
      logger.warn(`Could not extract S3 object key from URL: ${fileUrl}`)
      return
    }
    
    const key = urlParts.slice(bucketIndex + 1).join("/")

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
