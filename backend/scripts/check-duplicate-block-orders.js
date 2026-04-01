const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT "sectionId", "order", COUNT(*)::int AS total
    FROM "blocks"
    GROUP BY "sectionId", "order"
    HAVING COUNT(*) > 1
    ORDER BY "sectionId", "order";
  `;

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log('OK: no duplicate (sectionId, order) rows in blocks.');
    return;
  }

  console.error('Found duplicated block orders (sectionId, order):');
  for (const row of rows) {
    console.error(`  sectionId=${row.sectionId} order=${row.order} total=${row.total}`);
  }

  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error('Duplicate check failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
