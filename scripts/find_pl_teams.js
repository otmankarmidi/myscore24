const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const teams = await prisma.team.findMany({
    where: {
      OR: [
        { country: 'England' },
        { providerId: { in: [33, 34, 35, 36, 40, 42, 45, 47, 48, 49, 50, 51, 52, 55, 57, 65, 66, 39, 41, 46] } }
      ]
    },
    select: { id: true, providerId: true, name: true, code: true, logo: true }
  });
  console.log('Found English teams count:', teams.length);
  teams.forEach(t => console.log(`${t.providerId} | ${t.name} | ${t.code} | ${t.id}`));
}

run().catch(console.error).finally(() => prisma.$disconnect());
