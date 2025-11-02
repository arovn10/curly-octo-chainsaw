import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@noshlog.com" },
    update: {},
    create: {
      email: "demo@noshlog.com",
      username: "demo",
      name: "Demo User",
    },
  });

  await prisma.ingredientRef.createMany({
    data: [
      { name: "Tomato", aliases: ["tomatoes", "tomato"] },
      { name: "Olive Oil", aliases: ["EVOO", "extra virgin olive oil"] },
      { name: "Spaghetti", aliases: ["pasta"] },
      { name: "Garlic", aliases: ["garlic cloves"] },
      { name: "Butter", aliases: ["unsalted butter"] },
    ],
    skipDuplicates: true,
  });

  const meal1 = await prisma.meal.create({
    data: {
      userId: user.id,
      title: "Weeknight Tomato Pasta",
      description: "Quick and easy pasta dish",
      tags: ["30min", "vegetarian", "italian"],
      difficulty: "EASY",
      prepMinutes: 10,
      activeMinutes: 15,
      totalMinutes: 25,
      servings: 2,
      isPublic: true,
      sentiment: "LOVED",
      costPerServingCents: 225,
      globalScore: 1600,
      ingredients: {
        create: [
          {
            rawName: "Spaghetti",
            quantity: 200,
            unit: "g",
            unitPriceCents: 150,
            priceDate: new Date(),
          },
          {
            rawName: "Crushed tomatoes 28oz",
            quantity: 1,
            unit: "can",
            unitPriceCents: 199,
            priceDate: new Date(),
          },
        ],
      },
      recipe: {
        create: {
          yield: 2,
          utensils: ["Large pot", "Colander"],
          steps: {
            create: [
              {
                stepNumber: 1,
                instruction: "Bring a large pot of salted water to a boil",
              },
              {
                stepNumber: 2,
                instruction: "Add spaghetti and cook according to package directions",
                timerSeconds: 600,
              },
              {
                stepNumber: 3,
                instruction: "Heat crushed tomatoes in a pan, season with salt and pepper",
                photoPrompt: true,
              },
              {
                stepNumber: 4,
                instruction: "Drain pasta and mix with sauce",
              },
            ],
          },
        },
      },
    },
  });

  const meal2 = await prisma.meal.create({
    data: {
      userId: user.id,
      title: "Garlic Butter Shrimp",
      description: "Simple and delicious shrimp dish",
      tags: ["seafood", "30min", "quick"],
      difficulty: "EASY",
      prepMinutes: 5,
      activeMinutes: 10,
      totalMinutes: 15,
      servings: 2,
      isPublic: true,
      sentiment: "LOVED",
      costPerServingCents: 550,
      globalScore: 1650,
      ingredients: {
        create: [
          {
            rawName: "Shrimp",
            quantity: 1,
            unit: "lb",
            unitPriceCents: 999,
            priceDate: new Date(),
          },
          {
            rawName: "Butter",
            quantity: 4,
            unit: "tbsp",
            isPantry: true,
          },
          {
            rawName: "Garlic",
            quantity: 4,
            unit: "cloves",
            isPantry: true,
          },
        ],
      },
    },
  });

  // Create initial Elo ratings
  await prisma.eloRating.createMany({
    data: [
      { userId: user.id, mealId: meal1.id, rating: 1600 },
      { userId: user.id, mealId: meal2.id, rating: 1650 },
    ],
    skipDuplicates: true,
  });

  console.log("Seed data created!");
  console.log("User ID:", user.id);
  console.log("Meal 1 ID:", meal1.id);
  console.log("Meal 2 ID:", meal2.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

