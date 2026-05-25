# Backend Storage Options - Complete Guide

You have **3 options** for handling document uploads with AWS S3:

---

## Option 1: Direct Frontend → S3 Upload (Current Implementation) ✅

**How it works:**
- Frontend uploads directly to S3 using AWS SDK
- Backend only stores the S3 URL in database
- No files pass through your server

**Pros:**
- ✅ Faster uploads (direct to S3)
- ✅ Less server bandwidth
- ✅ Scales better
- ✅ Already implemented in the app

**Cons:**
- ⚠️ Frontend needs AWS credentials
- ⚠️ Less control over validation

**Use this if:** You want the fastest, most scalable solution

**Configuration:**
```env
# In .env.local
NEXT_PUBLIC_STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=garbha-suraksha-documents
```

---

## Option 2: Frontend → FastAPI → S3 (Recommended for Control)

**How it works:**
- Frontend sends file to FastAPI backend
- FastAPI validates and uploads to S3
- FastAPI returns S3 key to frontend
- Frontend stores S3 key in Supabase

**Pros:**
- ✅ Full control over validation
- ✅ Can scan files for viruses
- ✅ Better audit logging
- ✅ No AWS credentials in frontend

**Cons:**
- ⚠️ Files pass through your server (uses bandwidth)
- ⚠️ Slower for large files

**Use this if:** You have a FastAPI backend and want more control

### Setup Steps:

#### 1. Start FastAPI Backend

```bash
# Create Python virtual environment
cd backend-examples
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_S3_BUCKET=garbha-suraksha-documents

# Run FastAPI
python fastapi-s3-upload.py
```

Backend will run on http://localhost:8000

#### 2. Configure Frontend

Add to `.env.local`:
```env
NEXT_PUBLIC_STORAGE_PROVIDER=backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### 3. Update Storage Helper

In `/lib/storage.ts`, add support for backend uploads:

```typescript
import { uploadDocumentViaBackend } from './backend-storage';

export async function uploadDocument(
  file: File,
  path: string
): Promise<string | null> {
  const STORAGE_PROVIDER = process.env.NEXT_PUBLIC_STORAGE_PROVIDER;

  if (STORAGE_PROVIDER === 'backend') {
    // Use FastAPI backend
    const [userId, documentType] = path.split('/');
    return await uploadDocumentViaBackend(file, userId, documentType as any);
  }
  
  // ... existing S3 or Supabase logic
}
```

---

## Option 3: Presigned URLs (Best of Both Worlds)

**How it works:**
- Frontend asks backend for presigned S3 URL
- Frontend uploads directly to S3 using presigned URL
- Backend doesn't handle the file, just generates URL

**Pros:**
- ✅ Direct upload (fast)
- ✅ No AWS credentials in frontend
- ✅ Backend controls permissions
- ✅ No bandwidth used on your server

**Cons:**
- ⚠️ More complex to implement

**Use this if:** You want security + performance

### Implementation:

**FastAPI Endpoint:**
```python
from boto3 import client as boto3_client
from fastapi import FastAPI

s3_client = boto3_client('s3')

@app.post("/api/get-upload-url")
async def get_upload_url(
    filename: str,
    user_id: str,
    document_type: str
):
    """Generate presigned URL for direct S3 upload"""
    
    file_key = f"{user_id}/{document_type}/{filename}"
    
    presigned_url = s3_client.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': 'garbha-suraksha-documents',
            'Key': file_key,
            'ContentType': 'application/pdf'
        },
        ExpiresIn=3600  # 1 hour
    )
    
    return {
        "upload_url": presigned_url,
        "file_key": file_key
    }
```

**Frontend:**
```typescript
// 1. Get presigned URL from backend
const response = await fetch('http://localhost:8000/api/get-upload-url', {
  method: 'POST',
  body: JSON.stringify({
    filename: file.name,
    user_id: userId,
    document_type: 'degree'
  })
});

const { upload_url, file_key } = await response.json();

// 2. Upload directly to S3 using presigned URL
await fetch(upload_url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
});

// 3. Store file_key in database
```

---

## Comparison Table

| Feature | Direct S3 | Via Backend | Presigned URLs |
|---------|-----------|-------------|----------------|
| Speed | ⚡⚡⚡ Fast | ⚡ Slower | ⚡⚡⚡ Fast |
| Bandwidth | None | High | None |
| Security | Medium | High | High |
| Control | Low | High | Medium |
| Complexity | Low | Low | Medium |
| **Recommended for** | Quick MVP | Production | Enterprise |

---

## My Recommendation

### For Your Use Case:

Since you mentioned you have AWS account and want S3:

**Phase 1 (Now)**: Use **Option 1 (Direct S3)**
- Fastest to implement ✅
- Already done ✅
- Good for MVP

**Phase 2 (Later)**: Switch to **Option 3 (Presigned URLs)**
- Better security
- Still fast
- More control

---

## Quick Start for Option 1 (Direct S3)

You're already set up! Just:

1. **Run the AWS setup script:**
```bash
cd /Users/aashokhazari/Repos/Garbha-Raksha/garbha-suraksha-app
./scripts/setup-aws-s3.sh
```

2. **Copy credentials to .env.local:**
```env
NEXT_PUBLIC_STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from script output>
AWS_SECRET_ACCESS_KEY=<from script output>
AWS_S3_BUCKET=garbha-suraksha-documents
```

3. **Test:**
```bash
npm run dev
# Go to http://localhost:3000/dashboard/register
# Upload a document - it goes straight to S3!
```

---

## If You Want FastAPI Backend Option

1. **Copy backend code:**
```bash
cp backend-examples/fastapi-s3-upload.py /path/to/your/fastapi/app/
```

2. **Install dependencies:**
```bash
pip install -r backend-examples/requirements.txt
```

3. **Update frontend storage.ts** to use backend adapter

4. **Set env var:**
```env
NEXT_PUBLIC_STORAGE_PROVIDER=backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Security Best Practices

### For Direct S3 Uploads:
- ✅ Use IAM user with minimal permissions
- ✅ Enable CORS only for your domains
- ✅ Block all public access
- ✅ Rotate access keys every 90 days
- ✅ Use signed URLs for viewing (expires in 1 hour)

### For Backend Uploads:
- ✅ Validate file type and size
- ✅ Scan for viruses (optional: ClamAV)
- ✅ Rate limit uploads
- ✅ Log all uploads for audit

---

## Questions?

- Direct S3 is **already working** in your app
- Backend examples are in `/backend-examples/` if you need them
- Run `./scripts/setup-aws-s3.sh` to configure AWS

Choose **Option 1** for now, it's the fastest! 🚀
