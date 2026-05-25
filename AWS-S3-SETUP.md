# AWS S3 Setup Guide

## Option 1: Supabase Storage (Recommended - Easiest)

**Time**: 2 minutes

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **Storage** → **New bucket**
3. Name: `doctor-documents`
4. Public: **OFF**
5. Click **Create**

✅ Done! No additional configuration needed.

---

## Option 2: AWS S3 (If you prefer AWS)

**Time**: 10 minutes

### Prerequisites
- AWS Account
- AWS CLI installed (or use AWS Console)

---

### Step 1: Create S3 Bucket

**Via AWS CLI:**
```bash
aws s3 mb s3://garbha-suraksha-documents --region us-east-1
```

**Via AWS Console:**
1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **Create bucket**
3. Settings:
   - **Bucket name**: `garbha-suraksha-documents`
   - **Region**: `us-east-1` (or your preferred region)
   - **Block all public access**: ✅ **ON** (keep files private)
   - **Bucket Versioning**: Optional (recommended for safety)
4. Click **Create bucket**

---

### Step 2: Create IAM User for App

**Via AWS CLI:**
```bash
# 1. Create user
aws iam create-user --user-name garbha-suraksha-app

# 2. Create policy for this specific bucket
cat > s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::garbha-suraksha-documents",
        "arn:aws:s3:::garbha-suraksha-documents/*"
      ]
    }
  ]
}
EOF

aws iam put-user-policy \
  --user-name garbha-suraksha-app \
  --policy-name GarbhaSurakshaS3Access \
  --policy-document file://s3-policy.json

# 3. Create access keys
aws iam create-access-key --user-name garbha-suraksha-app
```

**Via AWS Console:**
1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Add users**
3. User name: `garbha-suraksha-app`
4. Select **Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach policies directly**
7. Click **Create policy** → **JSON** tab
8. Paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::garbha-suraksha-documents",
        "arn:aws:s3:::garbha-suraksha-documents/*"
      ]
    }
  ]
}
```
9. Name: `GarbhaSurakshaS3Access`
10. Click **Create policy**
11. Go back and attach this policy to the user
12. Click **Create user**
13. **IMPORTANT**: Save the **Access Key ID** and **Secret Access Key**

---

### Step 3: Configure CORS (Important!)

S3 needs CORS configuration to allow browser uploads.

**Via AWS CLI:**
```bash
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
  --bucket garbha-suraksha-documents \
  --cors-configuration file://cors.json
```

**Via AWS Console:**
1. Go to your bucket → **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit**
4. Paste:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```
5. Click **Save changes**

---

### Step 4: Install AWS SDK

```bash
cd /Users/aashokhazari/Repos/Garbha-Raksha/garbha-suraksha-app
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

---

### Step 5: Configure Environment Variables

Add to `.env.local`:

```env
# Storage Provider: 'supabase' or 's3'
NEXT_PUBLIC_STORAGE_PROVIDER=s3

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=garbha-suraksha-documents
```

**⚠️ SECURITY**: Never commit `.env.local` to git! Add to `.gitignore`:
```bash
echo ".env.local" >> .gitignore
```

---

### Step 6: Test the Integration

1. Start your app:
```bash
npm run dev
```

2. Go to `/dashboard/register`
3. Fill in the form and upload a document
4. Check your S3 bucket in AWS Console to see the uploaded file

---

## Switching Between Supabase and S3

### Use Supabase Storage
```env
NEXT_PUBLIC_STORAGE_PROVIDER=supabase
# No AWS credentials needed
```

### Use AWS S3
```env
NEXT_PUBLIC_STORAGE_PROVIDER=s3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=garbha-suraksha-documents
```

The app automatically switches based on `NEXT_PUBLIC_STORAGE_PROVIDER`.

---

## File Organization in S3

Files are organized by user ID:

```
garbha-suraksha-documents/
├── user_123abc/
│   ├── degree/
│   │   └── 1234567890-certificate.pdf
│   ├── registration/
│   │   └── 1234567890-registration.pdf
│   ├── govt-id/
│   │   └── 1234567890-aadhaar.pdf
│   └── photo/
│       └── 1234567890-profile.jpg
├── user_456def/
│   └── ...
```

---

## Security Best Practices

### ✅ DO
- Use IAM user with **least privilege** (only S3 access)
- Enable **bucket versioning** (recover accidentally deleted files)
- Use **signed URLs** for viewing (expires after 1 hour)
- Keep files **private** (block all public access)
- Rotate access keys every 90 days
- Use environment variables (never hardcode keys)

### ❌ DON'T
- Don't make bucket public
- Don't use root AWS account credentials
- Don't commit `.env.local` to git
- Don't give `s3:*` permissions (too broad)
- Don't store unencrypted sensitive data

---

## Cost Estimate (AWS S3)

**Assumptions:**
- 100 doctors register per month
- 4 documents per doctor (degree, registration, ID, photo)
- Average file size: 2MB
- Files stored for 3 years

**Monthly costs:**
- Storage: 100 doctors × 4 files × 2MB × $0.023/GB = **~$0.02/month**
- Requests (uploads): 400 uploads × $0.005/1000 = **<$0.01/month**
- Data transfer (viewing): ~1GB × $0.09/GB = **~$0.09/month**

**Total: ~$0.12/month** (essentially free at this scale)

---

## Comparison: Supabase vs AWS S3

| Feature | Supabase Storage | AWS S3 |
|---------|------------------|--------|
| Setup Time | 2 minutes | 10 minutes |
| Configuration | Zero | Moderate |
| Free Tier | 1GB | 5GB |
| Monthly Cost (after free tier) | $0.021/GB | $0.023/GB |
| Integration | Built-in | Manual |
| Signed URLs | Automatic | Manual |
| Permissions | Row-level security | IAM policies |

**Recommendation**: Use **Supabase Storage** unless you:
- Already have AWS infrastructure
- Need advanced S3 features (lifecycle policies, cross-region replication)
- Want to centralize all files in your existing S3 buckets

---

## Troubleshooting

### Error: "Access Denied"
→ Check IAM policy allows `s3:PutObject` for your bucket

### Error: "CORS policy blocked"
→ Add your domain to CORS AllowedOrigins in bucket settings

### Error: "SignatureDoesNotMatch"
→ Verify `AWS_SECRET_ACCESS_KEY` is correct in `.env.local`

### Files uploading but can't view
→ Check IAM policy allows `s3:GetObject`

### Want to test locally with AWS
→ Make sure CORS includes `http://localhost:3000`

---

## Production Deployment

When deploying to production (Vercel, etc.):

1. **Add environment variables** in your hosting platform:
   - Vercel: Settings → Environment Variables
   - Add all AWS_* variables

2. **Update CORS** in S3:
   - Add your production domain to AllowedOrigins
   - Example: `https://app.garbhasuraksha.com`

3. **Use secrets manager** (optional but recommended):
   - AWS Secrets Manager
   - Vercel Environment Variables with encryption

---

## Questions?

- AWS S3 Docs: https://docs.aws.amazon.com/s3/
- IAM Best Practices: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
- Cost Calculator: https://calculator.aws/

Happy configuring! 🚀
