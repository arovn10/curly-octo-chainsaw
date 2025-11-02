export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  PRISMA_ACCELERATE_URL: process.env.PRISMA_ACCELERATE_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "noshlog-secret-key-change-in-production",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID ?? "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY ?? "",
  S3_REGION: process.env.S3_REGION ?? "",
  S3_BUCKET_UPLOADS: process.env.S3_BUCKET_UPLOADS ?? "noshlog-uploads",
};

