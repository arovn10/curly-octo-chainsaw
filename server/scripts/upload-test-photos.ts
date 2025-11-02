import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const API_BASE = 'http://localhost:3000/api';

// Test meal photos to download and upload
const MEAL_PHOTOS = [
  {
    title: 'Garlic Butter Shrimp',
    photos: [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615197348652-c9d03bbf16f5?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Pasta Carbonara',
    photos: [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601233749202-11d5c3c7e5a3?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Chicken Caesar Salad',
    photos: [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583435544816-0e84c6d3e8f5?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Beef Tacos',
    photos: [
      'https://images.unsplash.com/photo-1565299585323-38174c3c03b4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Grilled Salmon',
    photos: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Vegetable Stir Fry',
    photos: [
      'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Homemade Pizza',
    photos: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Chicken Curry',
    photos: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Avocado Toast',
    photos: [
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Spaghetti and Meatballs',
    photos: [
      'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Chocolate Chip Cookies',
    photos: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Beef Burger',
    photos: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Sushi Rolls',
    photos: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'BBQ Ribs',
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop',
    ],
  },
  {
    title: 'Chicken Pad Thai',
    photos: [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop',
    ],
  },
];

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const buffer = await response.buffer();
  fs.writeFileSync(filepath, buffer);
}

async function uploadToS3(filepath: string, filename: string): Promise<string> {
  // Get presigned URL from backend
  const uploadResponse = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      contentType: 'image/jpeg',
    }),
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Failed to get upload URL: ${error}`);
  }

  const { ok, data, error } = await uploadResponse.json() as any;
  
  if (!ok || !data) {
    throw new Error(`Upload URL error: ${error || 'Unknown error'}`);
  }

  const { uploadUrl, publicUrl } = data;

  // Upload file to S3
  const fileBuffer = fs.readFileSync(filepath);
  const uploadResult = await fetch(uploadUrl, {
    method: 'PUT',
    body: fileBuffer,
    headers: {
      'Content-Type': 'image/jpeg',
    },
  });

  if (!uploadResult.ok) {
    throw new Error(`Failed to upload to S3: ${uploadResult.statusText}`);
  }

  return publicUrl;
}

async function uploadTestPhotos() {
  console.log('📸 Uploading test meal photos to S3...\n');

  const tempDir = path.join(process.cwd(), 'temp-photos');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const uploadedPhotos: Record<string, string[]> = {};

  try {
    for (const meal of MEAL_PHOTOS) {
      console.log(`\n📷 Processing: ${meal.title}`);
      const mealPhotos: string[] = [];

      for (let i = 0; i < meal.photos.length; i++) {
        const photoUrl = meal.photos[i];
        const filename = `${meal.title.toLowerCase().replace(/\s+/g, '-')}-${i + 1}.jpg`;
        const filepath = path.join(tempDir, filename);

        try {
          // Download image
          console.log(`   ⬇️  Downloading photo ${i + 1}...`);
          await downloadImage(photoUrl, filepath);

          // Upload to S3
          console.log(`   ⬆️  Uploading to S3...`);
          const s3Url = await uploadToS3(filepath, filename);
          mealPhotos.push(s3Url);
          console.log(`   ✅ Uploaded: ${s3Url.substring(0, 60)}...`);

          // Clean up local file
          fs.unlinkSync(filepath);
        } catch (error: any) {
          console.error(`   ❌ Error processing photo ${i + 1}: ${error.message}`);
          // Continue with next photo
        }
      }

      if (mealPhotos.length > 0) {
        uploadedPhotos[meal.title] = mealPhotos;
        console.log(`   ✅ ${mealPhotos.length} photos uploaded for ${meal.title}`);
      }
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }

    // Save uploaded URLs to file
    const outputFile = path.join(process.cwd(), 'scripts', 'uploaded-photos.json');
    fs.writeFileSync(outputFile, JSON.stringify(uploadedPhotos, null, 2));
    console.log(`\n💾 Saved uploaded photo URLs to: ${outputFile}`);

    console.log(`\n✅ Upload complete!`);
    console.log(`   📊 Total meals processed: ${Object.keys(uploadedPhotos).length}`);
    console.log(`   📸 Total photos uploaded: ${Object.values(uploadedPhotos).flat().length}\n`);

    return uploadedPhotos;
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server not running! Please start the Next.js server first:');
    console.error('   cd server && npm run dev\n');
    process.exit(1);
  }

  await uploadTestPhotos();
}

main();

