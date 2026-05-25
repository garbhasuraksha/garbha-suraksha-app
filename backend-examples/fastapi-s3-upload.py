"""
FastAPI Backend - S3 Document Upload
Alternative approach if you want uploads to go through FastAPI backend
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime
from typing import Optional
import uuid

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# AWS S3 Configuration
S3_BUCKET = os.getenv("AWS_S3_BUCKET", "garbha-suraksha-documents")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Initialize S3 client
s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


@app.post("/api/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = None,
    document_type: str = "general",
):
    """
    Upload document to S3

    Args:
        file: The file to upload
        user_id: User ID for organizing files
        document_type: Type of document (degree, registration, govt-id, photo)

    Returns:
        dict: S3 key and signed URL
    """
    try:
        # Validate file type
        allowed_extensions = [".pdf", ".jpg", ".jpeg", ".png"]
        file_ext = os.path.splitext(file.filename)[1].lower()

        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )

        # Validate file size (5MB limit)
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")

        # Generate unique file key
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        file_key = f"{user_id}/{document_type}/{timestamp}_{unique_id}{file_ext}"

        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=file_key,
            Body=content,
            ContentType=file.content_type,
            # Make file private
            ACL="private",
        )

        # Generate signed URL for viewing (expires in 1 hour)
        signed_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": file_key},
            ExpiresIn=3600,
        )

        return {
            "success": True,
            "file_key": file_key,
            "signed_url": signed_url,
            "message": "File uploaded successfully",
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.get("/api/get-document-url")
async def get_document_url(file_key: str, expires_in: int = 3600):
    """
    Generate signed URL for viewing document

    Args:
        file_key: S3 key of the document
        expires_in: URL expiration time in seconds (default 1 hour)

    Returns:
        dict: Signed URL
    """
    try:
        signed_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": file_key},
            ExpiresIn=expires_in,
        )

        return {
            "success": True,
            "signed_url": signed_url,
            "expires_in": expires_in,
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate URL: {str(e)}")


@app.delete("/api/delete-document")
async def delete_document(file_key: str):
    """
    Delete document from S3

    Args:
        file_key: S3 key of the document to delete

    Returns:
        dict: Success message
    """
    try:
        s3_client.delete_object(Bucket=S3_BUCKET, Key=file_key)

        return {
            "success": True,
            "message": "Document deleted successfully",
        }

    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")


@app.post("/api/upload-multiple-documents")
async def upload_multiple_documents(
    files: list[UploadFile] = File(...),
    user_id: str = None,
):
    """
    Upload multiple documents at once

    Args:
        files: List of files to upload
        user_id: User ID for organizing files

    Returns:
        dict: List of uploaded file keys and URLs
    """
    results = []

    for file in files:
        try:
            # Determine document type from filename or metadata
            document_type = "general"

            # Upload each file
            content = await file.read()
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            file_ext = os.path.splitext(file.filename)[1].lower()
            file_key = f"{user_id}/{document_type}/{timestamp}_{unique_id}{file_ext}"

            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=file_key,
                Body=content,
                ContentType=file.content_type,
                ACL="private",
            )

            signed_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": S3_BUCKET, "Key": file_key},
                ExpiresIn=3600,
            )

            results.append({
                "filename": file.filename,
                "file_key": file_key,
                "signed_url": signed_url,
                "success": True,
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "error": str(e),
                "success": False,
            })

    return {
        "success": True,
        "results": results,
        "total": len(files),
        "uploaded": sum(1 for r in results if r["success"]),
        "failed": sum(1 for r in results if not r["success"]),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
