const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing NomNom API Functions...\n');

  try {
    // 1. Test GET /api/meals (public feed)
    console.log('1️⃣ Testing GET /api/meals (public feed)...');
    const publicMealsRes = await fetch(`${API_BASE}/meals?isPublic=true`);
    const publicMeals = await publicMealsRes.json();
    console.log(`   ✅ Public meals: ${publicMeals.ok ? publicMeals.data?.length || 0 : 'ERROR'} meals`);
    if (!publicMeals.ok) console.log(`   ❌ Error: ${JSON.stringify(publicMeals.error)}`);

    // 2. Get or create test user via API (will be auto-created when we create a meal)
    console.log('\n2️⃣ Will create test user when creating meal...');
    const testUserId = 'test@nomnom.app'; // Email format, will be converted to UUID

    // 3. Test POST /api/meals (create meal)
    console.log('\n3️⃣ Testing POST /api/meals (create meal)...');
    const mealData = {
      userId: testUserId,
      title: 'Test Meal - Garlic Butter Shrimp',
      description: 'A delicious test meal created by API testing',
      tags: ['seafood', 'test', 'quick'],
      difficulty: 'EASY',
      prepMinutes: 10,
      totalMinutes: 20,
      servings: 2,
      costPerServingCents: 850,
      photos: ['https://via.placeholder.com/400x300.jpg?text=Test+Meal'],
      isPublic: true,
      recipe: {
        steps: [
          { instruction: 'Heat butter in pan', timerSeconds: null },
          { instruction: 'Add shrimp and cook for 3 minutes', timerSeconds: 180 },
          { instruction: 'Add garlic and serve', timerSeconds: null },
        ],
      },
    };

    const createRes = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mealData),
    });
    const createResult = await createRes.json();
    if (createResult.ok) {
      console.log(`   ✅ Meal created: ${createResult.data.id} - "${createResult.data.title}"`);
    } else {
      console.log(`   ❌ Error creating meal:`);
      console.log(`      Error: ${JSON.stringify(createResult.error)}`);
      if (createResult.details) {
        console.log(`      Details: ${JSON.stringify(createResult.details, null, 2)}`);
      }
      console.log(`      Full response: ${JSON.stringify(createResult, null, 2)}`);
    }

    // 4. Test GET /api/meals with userId (after meal creation, we'll have the user ID)
    console.log('\n4️⃣ Testing GET /api/meals?userId=...');
    const userMealsRes = await fetch(`${API_BASE}/meals?userId=${testUserId}`);
    const userMeals = await userMealsRes.json();
    if (userMeals.ok) {
      console.log(`   ✅ User meals: ${userMeals.data?.length || 0} meals found`);
      if (userMeals.data?.length > 0) {
        console.log(`   📝 Latest meal: "${userMeals.data[0].title}"`);
      }
    } else {
      console.log(`   ❌ Error: ${JSON.stringify(userMeals.error)}`);
    }

    // 5. Test POST /api/upload (S3 presigned URL)
    console.log('\n5️⃣ Testing POST /api/upload (S3)...');
    const uploadRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'test-photo.jpg',
        contentType: 'image/jpeg',
      }),
    });
    const uploadResult = await uploadRes.json();
    if (uploadResult.ok) {
      console.log(`   ✅ Upload URL generated: ${uploadResult.data.publicUrl}`);
    } else {
      console.log(`   ⚠️  Upload URL error (S3 may not be configured): ${uploadResult.error}`);
    }

    // 6. Create multiple test meals
    console.log('\n6️⃣ Creating multiple test meals...');
    const testMeals = [
      {
        userId: testUserId,
        title: 'Test Pasta Carbonara',
        description: 'Creamy pasta dish',
        tags: ['pasta', 'italian', 'dinner'],
        difficulty: 'MEDIUM',
        prepMinutes: 15,
        totalMinutes: 30,
        servings: 4,
        costPerServingCents: 450,
        isPublic: true,
      },
      {
        userId: testUserId,
        title: 'Test Chicken Salad',
        description: 'Healthy lunch option',
        tags: ['salad', 'healthy', 'lunch'],
        difficulty: 'EASY',
        prepMinutes: 5,
        totalMinutes: 10,
        servings: 1,
        costPerServingCents: 650,
        isPublic: true,
      },
    ];

    for (const meal of testMeals) {
      const res = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
      });
      const result = await res.json();
      if (result.ok) {
        console.log(`   ✅ Created: ${result.data.title}`);
      } else {
        console.log(`   ❌ Failed: ${meal.title} - ${JSON.stringify(result.error)}`);
      }
    }

    // 7. Final check - get all public meals
    console.log('\n7️⃣ Final check - All public meals...');
    const finalRes = await fetch(`${API_BASE}/meals?isPublic=true`);
    const finalMeals = await finalRes.json();
    if (finalMeals.ok) {
      console.log(`   ✅ Total public meals: ${finalMeals.data?.length || 0}`);
      if (finalMeals.data?.length > 0) {
        console.log(`   📋 Meals:`);
        finalMeals.data.slice(0, 5).forEach((meal: any, i: number) => {
          console.log(`      ${i + 1}. "${meal.title}" by ${meal.user?.name || 'Unknown'}`);
        });
      }
    } else {
      console.log(`   ❌ Error: ${JSON.stringify(finalMeals.error)}`);
    }

    console.log('\n✅ API Testing Complete!\n');
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

testAPI();

