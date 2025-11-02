import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn', 'query'],
});

async function checkDatabase() {
  console.log('🔍 Checking database connection...\n');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    ` as Array<{ table_name: string }>;
    
    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach((t) => console.log(`   - ${t.table_name}`));
    
    // Check Meal table specifically
    const hasMealTable = tables.some((t) => t.table_name === 'Meal');
    if (!hasMealTable) {
      console.log('\n⚠️  Meal table not found!');
      console.log('   Run: npm run prisma:migrate:dev');
    } else {
      // Try to count meals
      const mealCount = await prisma.meal.count();
      console.log(`\n✅ Meal table exists with ${mealCount} meals`);
    }
    
  } catch (error: any) {
    console.error('\n❌ Database check failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.code === 'P1001') {
      console.error('\n   💡 Database connection issue. Check DATABASE_URL');
    } else if (error.code === 'P2021') {
      console.error('\n   💡 Tables don\'t exist. Run migrations:');
      console.error('      npm run prisma:migrate:dev');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

