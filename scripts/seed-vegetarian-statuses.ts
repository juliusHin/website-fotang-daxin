import { getDb } from '$lib/server/db';
import { vegetarianStatuses } from '$lib/server/schema';

async function seedVegetarianStatuses() {
  const db = getDb();

  const statuses = [
    { id: 1, name: 'belum' },
    { id: 2, name: 'belajar' },
    { id: 3, name: 'ikrar' },
  ];

  try {
    await db.insert(vegetarianStatuses).values(statuses);
    console.log('✅ Successfully seeded vegetarian_statuses');
  } catch (error) {
    console.error('❌ Error seeding vegetarian_statuses:', error);
    process.exit(1);
  }
}

seedVegetarianStatuses().catch(console.error);