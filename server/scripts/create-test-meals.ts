import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

const TEST_MEALS = [
  {
    title: 'Garlic Butter Shrimp',
    description: 'Quick and flavorful shrimp sautéed in garlic butter',
    tags: ['seafood', 'quick', 'easy'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 20,
    servings: 2,
    costPerServingCents: 850,
    photos: ['https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400'],
    isPublic: true,
  },
  {
    title: 'Pasta Carbonara',
    description: 'Classic Italian pasta with creamy sauce',
    tags: ['pasta', 'italian', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 30,
    servings: 4,
    costPerServingCents: 450,
    photos: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400'],
    isPublic: true,
  },
  {
    title: 'Chicken Caesar Salad',
    description: 'Fresh romaine lettuce with grilled chicken and caesar dressing',
    tags: ['salad', 'healthy', 'lunch'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 15,
    servings: 2,
    costPerServingCents: 650,
    photos: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'],
    isPublic: true,
  },
  {
    title: 'Beef Tacos',
    description: 'Spicy ground beef tacos with fresh toppings',
    tags: ['mexican', 'dinner', 'spicy'],
    difficulty: 'EASY',
    prepMinutes: 15,
    totalMinutes: 25,
    servings: 4,
    costPerServingCents: 575,
    photos: ['https://images.unsplash.com/photo-1565299585323-38174c3c03b4?w=400'],
    isPublic: true,
  },
  {
    title: 'Grilled Salmon',
    description: 'Perfectly grilled salmon with lemon and herbs',
    tags: ['seafood', 'healthy', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 5,
    totalMinutes: 20,
    servings: 2,
    costPerServingCents: 1200,
    photos: ['https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400'],
    isPublic: true,
  },
  {
    title: 'Vegetable Stir Fry',
    description: 'Colorful mix of fresh vegetables with soy sauce',
    tags: ['vegetarian', 'healthy', 'quick'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 15,
    servings: 3,
    costPerServingCents: 350,
    photos: ['https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400'],
    isPublic: true,
  },
  {
    title: 'Homemade Pizza',
    description: 'Classic margherita pizza with fresh mozzarella',
    tags: ['italian', 'dinner', 'comfort'],
    difficulty: 'MEDIUM',
    prepMinutes: 20,
    totalMinutes: 45,
    servings: 4,
    costPerServingCents: 425,
    photos: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'],
    isPublic: true,
  },
  {
    title: 'Chicken Curry',
    description: 'Spicy Indian chicken curry with rice',
    tags: ['indian', 'dinner', 'spicy'],
    difficulty: 'MEDIUM',
    prepMinutes: 15,
    totalMinutes: 45,
    servings: 4,
    costPerServingCents: 650,
    photos: ['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400'],
    isPublic: true,
  },
  {
    title: 'Avocado Toast',
    description: 'Simple and delicious breakfast favorite',
    tags: ['breakfast', 'healthy', 'quick'],
    difficulty: 'EASY',
    prepMinutes: 5,
    totalMinutes: 5,
    servings: 1,
    costPerServingCents: 275,
    photos: ['https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400'],
    isPublic: true,
  },
  {
    title: 'Spaghetti and Meatballs',
    description: 'Classic comfort food with homemade meatballs',
    tags: ['italian', 'comfort', 'dinner'],
    difficulty: 'MEDIUM',
    prepMinutes: 20,
    totalMinutes: 60,
    servings: 6,
    costPerServingCents: 500,
    photos: ['https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400'],
    isPublic: true,
  },
  {
    title: 'Chocolate Chip Cookies',
    description: 'Soft and chewy homemade cookies',
    tags: ['dessert', 'baking', 'sweet'],
    difficulty: 'EASY',
    prepMinutes: 15,
    totalMinutes: 30,
    servings: 24,
    costPerServingCents: 125,
    photos: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400'],
    isPublic: true,
  },
  {
    title: 'Beef Burger',
    description: 'Juicy beef burger with all the fixings',
    tags: ['american', 'dinner', 'comfort'],
    difficulty: 'EASY',
    prepMinutes: 10,
    totalMinutes: 20,
    servings: 4,
    costPerServingCents: 625,
    photos: ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=400'],
    isPublic: true,
  },
];

async function createTestMeals() {
  console.log('🍽️  Creating test meals for NomNom...\n');

  try {
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
            photos: mealData.photos,
            isPublic: mealData.isPublic,
            globalScore: 1500,
          },
        });

        console.log(`✅ Created: "${meal.title}" (${meal.id.substring(0, 8)}...)`);
        created++;
      } catch (error: any) {
        console.error(`❌ Error creating "${mealData.title}":`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created} meals`);
    console.log(`   ⏭️  Skipped: ${skipped} meals (already exist)`);
    console.log(`   📝 Total test meals: ${created + skipped}\n`);

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

createTestMeals();

