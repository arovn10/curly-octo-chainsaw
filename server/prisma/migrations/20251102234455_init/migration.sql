-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('LOVED', 'FINE', 'NOT_FOR_ME');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "name" TEXT,
    "image" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "prepMinutes" INTEGER,
    "cookMinutes" INTEGER,
    "totalMinutes" INTEGER,
    "servings" INTEGER,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" "Sentiment",
    "costPerServingCents" INTEGER,
    "photos" TEXT[],
    "globalScore" DOUBLE PRECISION DEFAULT 1500,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngredientRef" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aliases" TEXT[],

    CONSTRAINT "IngredientRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealIngredient" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "ingredientRefId" TEXT,
    "rawName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION,
    "unit" TEXT,
    "isPantry" BOOLEAN NOT NULL DEFAULT false,
    "unitPriceCents" INTEGER,
    "priceDate" TIMESTAMP(3),

    CONSTRAINT "MealIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "mealAId" TEXT NOT NULL,
    "mealBId" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EloRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EloRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PairwiseComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealAId" TEXT NOT NULL,
    "mealBId" TEXT NOT NULL,
    "winner" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PairwiseComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "yield" INTEGER,
    "sourceUrl" TEXT,
    "sourceName" TEXT,
    "utensils" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeStep" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "instruction" TEXT NOT NULL,
    "timerSeconds" INTEGER,
    "photoPrompt" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "priceDate" TIMESTAMP(3),
    "store" TEXT,
    "brand" TEXT,
    "sourceLink" TEXT,
    "substitutions" TEXT[],
    "isPantry" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "taste" INTEGER,
    "texture" INTEGER,
    "difficulty" INTEGER,
    "value" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "listType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "position" INTEGER,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealListItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Meal_userId_createdAt_idx" ON "Meal"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Meal_isPublic_createdAt_idx" ON "Meal"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "Meal_globalScore_idx" ON "Meal"("globalScore");

-- CreateIndex
CREATE UNIQUE INDEX "IngredientRef_name_key" ON "IngredientRef"("name");

-- CreateIndex
CREATE INDEX "MealIngredient_mealId_idx" ON "MealIngredient"("mealId");

-- CreateIndex
CREATE INDEX "Comparison_userId_createdAt_idx" ON "Comparison"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EloRating_userId_rating_idx" ON "EloRating"("userId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "EloRating_userId_mealId_key" ON "EloRating"("userId", "mealId");

-- CreateIndex
CREATE INDEX "PairwiseComparison_userId_idx" ON "PairwiseComparison"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PairwiseComparison_userId_mealAId_mealBId_key" ON "PairwiseComparison"("userId", "mealAId", "mealBId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_mealId_key" ON "Recipe"("mealId");

-- CreateIndex
CREATE INDEX "RecipeStep_recipeId_idx" ON "RecipeStep"("recipeId");

-- CreateIndex
CREATE INDEX "Ingredient_recipeId_idx" ON "Ingredient"("recipeId");

-- CreateIndex
CREATE INDEX "Rating_userId_idx" ON "Rating"("userId");

-- CreateIndex
CREATE INDEX "Rating_mealId_idx" ON "Rating"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_mealId_userId_key" ON "Rating"("mealId", "userId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "Like_mealId_idx" ON "Like"("mealId");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_mealId_userId_key" ON "Like"("mealId", "userId");

-- CreateIndex
CREATE INDEX "Comment_mealId_idx" ON "Comment"("mealId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "MealList_userId_idx" ON "MealList"("userId");

-- CreateIndex
CREATE INDEX "MealListItem_listId_idx" ON "MealListItem"("listId");

-- CreateIndex
CREATE INDEX "MealListItem_mealId_idx" ON "MealListItem"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "MealListItem_listId_mealId_key" ON "MealListItem"("listId", "mealId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealIngredient" ADD CONSTRAINT "MealIngredient_ingredientRefId_fkey" FOREIGN KEY ("ingredientRefId") REFERENCES "IngredientRef"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_mealAId_fkey" FOREIGN KEY ("mealAId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_mealBId_fkey" FOREIGN KEY ("mealBId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EloRating" ADD CONSTRAINT "EloRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EloRating" ADD CONSTRAINT "EloRating_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseComparison" ADD CONSTRAINT "PairwiseComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseComparison" ADD CONSTRAINT "PairwiseComparison_mealAId_fkey" FOREIGN KEY ("mealAId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PairwiseComparison" ADD CONSTRAINT "PairwiseComparison_mealBId_fkey" FOREIGN KEY ("mealBId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeStep" ADD CONSTRAINT "RecipeStep_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealList" ADD CONSTRAINT "MealList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealListItem" ADD CONSTRAINT "MealListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "MealList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealListItem" ADD CONSTRAINT "MealListItem_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
