import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

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
    photos: [
      'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615197348652-c9d03bbf16f5?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601233749202-11d5c3c7e5a3?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1583435544816-0e84c6d3e8f5?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1565299585323-38174c3c03b4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop'
    ],
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
    photos: [
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&h=600&fit=crop'
    ],
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

