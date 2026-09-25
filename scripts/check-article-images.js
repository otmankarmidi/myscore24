const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'mysql://u875998119_myscore24admin:Malika2019*@srv991.hstgr.io:3306/u875998119_myscore24'
    }
  }
});

async function main() {
  try {
    const articles = await prisma.article.findMany({
      take: 10,
      select: { id: true, title: true, featuredImage: true }
    });
    console.log('ARTICLES:', JSON.stringify(articles, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
