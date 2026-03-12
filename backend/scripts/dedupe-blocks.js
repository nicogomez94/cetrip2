const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Keep the oldest block for each (sectionId, order) pair and remove the rest.
  const deleted = await prisma.$executeRawUnsafe(`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY "sectionId", "order"
          ORDER BY id ASC
        ) AS rn
      FROM "blocks"
    )
    DELETE FROM "blocks" b
    USING ranked r
    WHERE b.id = r.id
      AND r.rn > 1;
  `);

  console.log(`Removed duplicated blocks: ${deleted}`);
}

main()
  .catch((error) => {
    // Ignore "table does not exist" for first deploys before schema creation.
    if (error?.code === '42P01') {
      console.log('Skipping dedupe: blocks table does not exist yet.');
      return;
    }
    console.error('Block dedupe failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
