/**
 * AWS S3 Integration for Document Storage
 * Alternative to Supabase Storage
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'garbha-suraksha-documents';

/**
 * Upload file to S3
 */
export async function uploadFileToS3(
  file: File,
  path: string
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileKey = `${path}/${Date.now()}-${file.name}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
    // Make file private
    ACL: 'private',
  });

  await s3Client.send(command);

  // Return the S3 key (we'll generate signed URLs when needed)
  return fileKey;
}

/**
 * Get signed URL for viewing document (expires in 1 hour)
 */
export async function getDocumentUrl(
  fileKey: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  await s3Client.send(command);
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
  files: { file: File; path: string }[]
): Promise<string[]> {
  const uploadPromises = files.map(({ file, path }) =>
    uploadFileToS3(file, path)
  );

  return Promise.all(uploadPromises);
}

/**
 * Generate URLs for multiple documents
 */
export async function getMultipleDocumentUrls(
  fileKeys: string[]
): Promise<Record<string, string>> {
  const urlPromises = fileKeys.map(async (key) => ({
    key,
    url: await getDocumentUrl(key),
  }));

  const results = await Promise.all(urlPromises);

  return results.reduce((acc, { key, url }) => {
    acc[key] = url;
    return acc;
  }, {} as Record<string, string>);
}
