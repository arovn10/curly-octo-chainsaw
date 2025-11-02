import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_UPLOADS || 'homecookmealsapp';

export async function getSignedUploadUrl(
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
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

