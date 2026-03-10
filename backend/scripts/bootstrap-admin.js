const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@cetrip.com').toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME || 'Administrador CETRIP';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`Admin ensured: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
