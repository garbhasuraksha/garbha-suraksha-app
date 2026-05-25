#!/bin/bash
# AWS S3 Setup Script for Garbha Suraksha
# This script helps you set up S3 bucket and IAM user

set -e

BUCKET_NAME="garbha-suraksha-documents"
REGION="us-east-1"
IAM_USER="garbha-suraksha-app"

echo "🚀 Garbha Suraksha - AWS S3 Setup"
echo "=================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"
echo ""

# Step 1: Create S3 Bucket
echo "📦 Step 1: Creating S3 bucket..."
if aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null; then
    echo "✅ Bucket created: s3://$BUCKET_NAME"
else
    echo "⚠️  Bucket already exists or error occurred"
fi
echo ""

# Step 2: Block public access
echo "🔒 Step 2: Blocking public access..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    2>/dev/null || echo "⚠️  Public access block already configured"
echo "✅ Public access blocked"
echo ""

# Step 3: Enable versioning (recommended)
echo "📝 Step 3: Enabling versioning..."
aws s3api put-bucket-versioning \
    --bucket $BUCKET_NAME \
    --versioning-configuration Status=Enabled \
    2>/dev/null || echo "⚠️  Versioning already enabled"
echo "✅ Versioning enabled"
echo ""

# Step 4: Configure CORS
echo "🌐 Step 4: Configuring CORS..."
cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:8000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file:///tmp/cors.json
echo "✅ CORS configured"
echo ""

# Step 5: Create IAM user
echo "👤 Step 5: Creating IAM user..."
if aws iam create-user --user-name $IAM_USER 2>/dev/null; then
    echo "✅ IAM user created: $IAM_USER"
else
    echo "⚠️  IAM user already exists"
fi
echo ""

# Step 6: Create and attach policy
echo "🔑 Step 6: Creating IAM policy..."
cat > /tmp/s3-policy.json <<EOF
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
        "arn:aws:s3:::$BUCKET_NAME",
        "arn:aws:s3:::$BUCKET_NAME/*"
      ]
    }
  ]
}
EOF

aws iam put-user-policy \
    --user-name $IAM_USER \
    --policy-name GarbhaSurakshaS3Access \
    --policy-document file:///tmp/s3-policy.json
echo "✅ IAM policy attached"
echo ""

# Step 7: Create access keys
echo "🔐 Step 7: Creating access keys..."
if KEY_OUTPUT=$(aws iam create-access-key --user-name $IAM_USER 2>/dev/null); then
    ACCESS_KEY=$(echo $KEY_OUTPUT | jq -r '.AccessKey.AccessKeyId')
    SECRET_KEY=$(echo $KEY_OUTPUT | jq -r '.AccessKey.SecretAccessKey')

    echo ""
    echo "✅ Access keys created!"
    echo ""
    echo "================================================"
    echo "⚠️  IMPORTANT: Save these credentials securely!"
    echo "================================================"
    echo ""
    echo "AWS_REGION=$REGION"
    echo "AWS_ACCESS_KEY_ID=$ACCESS_KEY"
    echo "AWS_SECRET_ACCESS_KEY=$SECRET_KEY"
    echo "AWS_S3_BUCKET=$BUCKET_NAME"
    echo ""
    echo "Add these to your .env.local file"
    echo ""
else
    echo "⚠️  Access keys already exist or error occurred"
    echo ""
    echo "To create new access keys, first delete existing ones:"
    echo "1. List keys: aws iam list-access-keys --user-name $IAM_USER"
    echo "2. Delete old key: aws iam delete-access-key --user-name $IAM_USER --access-key-id <KEY_ID>"
    echo "3. Run this script again"
fi

# Cleanup
rm -f /tmp/cors.json /tmp/s3-policy.json

echo ""
echo "✅ AWS S3 setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy the AWS credentials above to .env.local"
echo "2. Update CORS AllowedOrigins with your production domain"
echo "3. Test by uploading a document via /dashboard/register"
