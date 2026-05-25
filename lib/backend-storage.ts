/**
 * Backend Storage Adapter
 * Use this if you want uploads to go through FastAPI backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Upload file via FastAPI backend
 */
export async function uploadDocumentViaBackend(
  file: File,
  userId: string,
  documentType: 'degree' | 'registration' | 'govt-id' | 'photo' | 'general'
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('document_type', documentType);

    const response = await fetch(`${BACKEND_URL}/api/upload-document`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    const data = await response.json();

    // Return the file_key (S3 key) to store in database
    return data.file_key;

  } catch (error) {
    console.error('Backend upload error:', error);
    return null;
  }
}

/**
 * Get signed URL for viewing document
 */
export async function getDocumentUrlFromBackend(
  fileKey: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/get-document-url?file_key=${encodeURIComponent(fileKey)}`
    );

    if (!response.ok) {
      throw new Error('Failed to get document URL');
    }

    const data = await response.json();
    return data.signed_url;

  } catch (error) {
    console.error('Error getting document URL:', error);
    return null;
  }
}

/**
 * Upload multiple documents via backend
 */
export async function uploadMultipleDocumentsViaBackend(
  files: File[],
  userId: string
): Promise<Array<{ filename: string; file_key: string; success: boolean }>> {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('user_id', userId);

    const response = await fetch(`${BACKEND_URL}/api/upload-multiple-documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Batch upload failed');
    }

    const data = await response.json();
    return data.results;

  } catch (error) {
    console.error('Batch upload error:', error);
    return [];
  }
}

/**
 * Delete document via backend
 */
export async function deleteDocumentViaBackend(
  fileKey: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/delete-document?file_key=${encodeURIComponent(fileKey)}`,
      { method: 'DELETE' }
    );

    return response.ok;

  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}
