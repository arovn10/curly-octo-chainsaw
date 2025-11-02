import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Check if S3 credentials are available
const hasS3Config = !!(
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_UPLOADS
);

const s3Client = hasS3Config ? new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
}) : null;

const BUCKET_NAME = process.env.S3_BUCKET_UPLOADS || 'homecookmealsapp';

export async function getSignedUploadUrl(
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  if (!hasS3Config || !s3Client) {
    throw new Error('S3 configuration is missing. Please set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET_UPLOADS environment variables.');
  }
  
  const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
  
  const region = process.env.S3_REGION || 'us-east-1';
  const publicUrl = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  
  return { uploadUrl, key, publicUrl };
}

