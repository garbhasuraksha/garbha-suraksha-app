/**
 * Unified Storage Interface
 * Supports both Supabase Storage and AWS S3
 * Switch via STORAGE_PROVIDER env variable
 */

import { supabase } from './supabase';
import { uploadFileToS3, getDocumentUrl as getS3Url } from './aws-s3';

const STORAGE_PROVIDER = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase'; // 'supabase' or 's3'

/**
 * Upload file using configured storage provider
 */
export async function uploadDocument(
  file: File,
  path: string
): Promise<string | null> {
  if (STORAGE_PROVIDER === 's3') {
    // Use AWS S3
    try {
      const fileKey = await uploadFileToS3(file, path);
      // Store the S3 key (we'll generate signed URLs when viewing)
      return fileKey;
    } catch (error) {
      console.error('S3 upload error:', error);
      return null;
    }
  } else {
    // Use Supabase Storage (default)
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('doctor-documents')
      .upload(fileName, file);

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('doctor-documents')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}

/**
 * Get viewable URL for document
 * For Supabase: returns public URL
 * For S3: generates signed URL (expires in 1 hour)
 */
export async function getDocumentViewUrl(fileKey: string): Promise<string> {
  if (STORAGE_PROVIDER === 's3') {
    // Generate signed URL for S3
    return await getS3Url(fileKey);
  } else {
    // For Supabase, the fileKey is already the public URL
    return fileKey;
  }
}

/**
 * Upload multiple documents
 */
export async function uploadMultipleDocuments(
  files: { file: File; path: string }[]
): Promise<(string | null)[]> {
  const uploadPromises = files.map(({ file, path }) =>
    uploadDocument(file, path)
  );

  return Promise.all(uploadPromises);
}
