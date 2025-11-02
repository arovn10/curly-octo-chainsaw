import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Load uploaded photo URLs from JSON file
function loadUploadedPhotos(): Record<string, string[]> {
  const photosFile = path.join(__dirname, 'uploaded-photos.json');
  if (!fs.existsSync(photosFile)) {
    console.error('❌ uploaded-photos.json not found. Run upload-test-photos.ts first!');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(photosFile, 'utf-8'));
}

const TEST_MEALS = [
  {
    title: 'Garlic Butter Shrimp',
    description: 'Quick and flavorful shrimp sautéed in garlic butter with fresh herbs',
    tags: ['seafood', 'quick', 'easy'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 20,
    servings: 2,
    costPerServingCents: 850,
    isPublic: true,
  },
  {
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta with creamy egg sauce, pancetta, and parmesan',
    tags: ['pasta', 'italian', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 30,
    servings: 4,
    costPerServingCents: 450,
    isPublic: true,
  },
  {
    title: 'Chicken Caesar Salad',
    description: 'Fresh romaine lettuce with grilled chicken, caesar dressing, and croutons',
    tags: ['salad', 'healthy', 'lunch'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 15,
    servings: 2,
    costPerServingCents: 650,
    isPublic: true,
  },
  {
    title: 'Beef Tacos',
    description: 'Spicy ground beef tacos with lettuce, tomatoes, cheese, and sour cream',
    tags: ['mexican', 'dinner', 'spicy'],
    difficulty: 'EASY',
    prepMinutes: 15,
    totalMinutes: 25,
    servings: 4,
    costPerServingCents: 575,
    isPublic: true,
  },
  {
    title: 'Grilled Salmon',
    description: 'Perfectly grilled salmon with lemon, herbs, and roasted vegetables',
    tags: ['seafood', 'healthy', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 5,
    totalMinutes: 20,
    servings: 2,
    costPerServingCents: 1200,
    isPublic: true,
  },
  {
    title: 'Vegetable Stir Fry',
    description: 'Colorful mix of fresh vegetables with soy sauce and ginger',
    tags: ['vegetarian', 'healthy', 'quick'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 15,
    servings: 3,
    costPerServingCents: 350,
    isPublic: true,
  },
  {
    title: 'Homemade Pizza',
    description: 'Classic margherita pizza with fresh mozzarella, basil, and tomato sauce',
    tags: ['italian', 'dinner', 'comfort'],
    difficulty: 'MEDIUM',
    prepMinutes: 20,
    totalMinutes: 45,
    servings: 4,
    costPerServingCents: 425,
    isPublic: true,
  },
  {
    title: 'Chicken Curry',
    description: 'Spicy Indian chicken curry with basmati rice and naan bread',
    tags: ['indian', 'dinner', 'spicy'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 45,
    servings: 4,
    costPerServingCents: 650,
    isPublic: true,
  },
  {
    title: 'Avocado Toast',
    description: 'Simple and delicious breakfast with smashed avocado on sourdough',
    tags: ['breakfast', 'healthy', 'quick'],
    difficulty: 'EASY',
    prepMinutes: 5,
    totalMinutes: 5,
    servings: 1,
    costPerServingCents: 275,
    isPublic: true,
  },
  {
    title: 'Spaghetti and Meatballs',
    description: 'Classic comfort food with homemade meatballs and marinara sauce',
    tags: ['italian', 'comfort', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 20,
    totalMinutes: 60,
    servings: 6,
    costPerServingCents: 500,
    isPublic: true,
  },
  {
    title: 'Chocolate Chip Cookies',
    description: 'Soft and chewy homemade cookies with dark chocolate chunks',
    tags: ['dessert', 'baking', 'sweet'],
    difficulty: 'EASY',
    prepMinutes: 15,
    totalMinutes: 30,
    servings: 24,
    costPerServingCents: 125,
    isPublic: true,
  },
  {
    title: 'Beef Burger',
    description: 'Juicy beef burger with lettuce, tomato, onion, pickles, and special sauce',
    tags: ['american', 'dinner', 'comfort'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 20,
    servings: 4,
    costPerServingCents: 625,
    isPublic: true,
  },
  {
    title: 'Sushi Rolls',
    description: 'Fresh salmon and tuna rolls with avocado, cucumber, and wasabi',
    tags: ['japanese', 'seafood', 'dinner'],
    difficulty: 'HARD',
    prepMinutes: 30,
    totalMinutes: 60,
    servings: 4,
    costPerServingCents: 950,
    isPublic: true,
  },
  {
    title: 'BBQ Ribs',
    description: 'Slow-cooked pork ribs with tangy barbecue sauce and coleslaw',
    tags: ['american', 'bbq', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 180,
    servings: 4,
    costPerServingCents: 875,
    isPublic: true,
  },
  {
    title: 'Chicken Pad Thai',
    description: 'Authentic Thai stir-fried noodles with chicken, peanuts, and lime',
    tags: ['thai', 'noodles', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 25,
    servings: 3,
    costPerServingCents: 675,
    isPublic: true,
  },
];

async function createMealsWithS3Photos() {
  console.log('🍽️  Creating test meals with S3 photos...\n');

  try {
    // Load uploaded photo URLs
    const uploadedPhotos = loadUploadedPhotos();
    console.log(`📸 Loaded photos for ${Object.keys(uploadedPhotos).length} meals\n`);

    // Get or create test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@nomnom.app' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@nomnom.app',
          username: 'testuser',
          name: 'Test User',
          isPrivate: false,
        },
      });
      console.log(`✅ Created test user: ${testUser.id}\n`);
    } else {
      console.log(`✅ Using existing test user: ${testUser.id}\n`);
    }

    let created = 0;
    let skipped = 0;

    for (const mealData of TEST_MEALS) {
      try {
        // Check if meal already exists
        const existing = await prisma.meal.findFirst({
          where: {
            userId: testUser.id,
            title: mealData.title,
          },
        });

        if (existing) {
          console.log(`⏭️  Skipping "${mealData.title}" (already exists)`);
          skipped++;
          continue;
        }

        // Get S3 photos for this meal
        const photos = uploadedPhotos[mealData.title] || [];
        if (photos.length === 0) {
          console.log(`⚠️  No S3 photos found for "${mealData.title}", skipping...`);
          continue;
        }

        const meal = await prisma.meal.create({
          data: {
            userId: testUser.id,
            title: mealData.title,
            description: mealData.description,
            tags: mealData.tags,
            difficulty: mealData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
            prepMinutes: mealData.prepMinutes,
            totalMinutes: mealData.totalMinutes,
            servings: mealData.servings,
            costPerServingCents: mealData.costPerServingCents,
            photos: photos,
            isPublic: mealData.isPublic,
            globalScore: 1500,
          },
        });

        console.log(`✅ Created: "${meal.title}" with ${photos.length} S3 photos`);
        created++;
      } catch (error: any) {
        console.error(`❌ Error creating "${mealData.title}":`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} meals`);
    console.log(`   ⏭️  Skipped: ${skipped} meals (already exist)`);
    console.log(`   📝 Total meals: ${created + skipped}\n`);

    // Count total meals in database
    const totalMeals = await prisma.meal.count();
    console.log(`🗄️  Total meals in database: ${totalMeals}\n`);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createMealsWithS3Photos();

