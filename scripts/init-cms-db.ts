import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

function loadEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return
        const match = trimmed.match(/^([^=]+)=(.*)$/)
        if (match) {
          const key = match[1].trim()
          let value = match[2].trim()
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = value
          }
        }
      })
    }
  }
}

loadEnv()

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Safely initializing CMS tables on MySQL database...')

  try {
    // 1. Create categories table
    console.log('📦 Checking / creating table: categories')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(191) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`description\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 2. Create authors table
    console.log('📦 Checking / creating table: authors')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`authors\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(191) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`role\` VARCHAR(191) NULL DEFAULT 'Staff Writer',
        \`avatar\` VARCHAR(191) NULL,
        \`bio\` TEXT NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 3. Create tags table
    console.log('📦 Checking / creating table: tags')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`tags\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(191) NOT NULL,
        \`slug\` VARCHAR(191) NOT NULL UNIQUE,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 4. Create articles table
    console.log('📦 Checking / creating table: articles')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`articles\` (
        \`id\` VARCHAR(191) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`excerpt\` TEXT NOT NULL,
        \`content\` LONGTEXT NOT NULL,
        \`featuredImage\` VARCHAR(500) NULL,
        \`status\` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        \`publishedAt\` DATETIME(3) NULL,
        \`scheduledAt\` DATETIME(3) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        \`views\` INT NOT NULL DEFAULT 0,
        \`metaTitle\` VARCHAR(255) NULL,
        \`metaDescription\` VARCHAR(500) NULL,
        \`categoryId\` VARCHAR(191) NULL,
        \`authorId\` VARCHAR(191) NULL,
        \`competitionId\` VARCHAR(100) NULL,
        \`teamId\` VARCHAR(100) NULL,
        \`playerId\` VARCHAR(100) NULL,
        \`matchId\` VARCHAR(100) NULL,
        INDEX \`idx_articles_status\` (\`status\`),
        INDEX \`idx_articles_publishedAt\` (\`publishedAt\`),
        INDEX \`idx_articles_categoryId\` (\`categoryId\`),
        INDEX \`idx_articles_authorId\` (\`authorId\`),
        INDEX \`idx_articles_competitionId\` (\`competitionId\`),
        INDEX \`idx_articles_teamId\` (\`teamId\`),
        CONSTRAINT \`fk_articles_category\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT \`fk_articles_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`authors\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    // 5. Create article_tags junction table
    console.log('📦 Checking / creating table: article_tags')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`article_tags\` (
        \`articleId\` VARCHAR(191) NOT NULL,
        \`tagId\` VARCHAR(191) NOT NULL,
        PRIMARY KEY (\`articleId\`, \`tagId\`),
        INDEX \`idx_article_tags_tagId\` (\`tagId\`),
        CONSTRAINT \`fk_art_tag_article\` FOREIGN KEY (\`articleId\`) REFERENCES \`articles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`fk_art_tag_tag\` FOREIGN KEY (\`tagId\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `)

    console.log('✅ All 5 CMS tables verified/created successfully!')

    // 6. Seed initial categories if none exist
    const initialCategories = [
      { id: 'cat_general', name: 'General', slug: 'general', description: 'General football news and announcements' },
      { id: 'cat_transfers', name: 'Transfers', slug: 'transfers', description: 'Confirmed transfers, rumors, and contract news' },
      { id: 'cat_premier_league', name: 'Premier League', slug: 'premier-league', description: 'Premier League news and match reports' },
      { id: 'cat_champions_league', name: 'Champions League', slug: 'champions-league', description: 'UEFA Champions League coverage' },
      { id: 'cat_analysis', name: 'Analysis', slug: 'analysis', description: 'Tactical and statistical deep dives' },
    ]

    for (const cat of initialCategories) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO \`categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`createdAt\`, \`updatedAt\`)
        VALUES ('${cat.id}', '${cat.name}', '${cat.slug}', '${cat.description}', NOW(3), NOW(3))
        ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
      `)
    }
    console.log('✅ Seeded default categories.')

    // 7. Seed initial author if none exists
    await prisma.$executeRawUnsafe(`
      INSERT INTO \`authors\` (\`id\`, \`name\`, \`slug\`, \`role\`, \`avatar\`, \`bio\`, \`createdAt\`, \`updatedAt\`)
      VALUES ('auth_myscore24', 'MyScore24 Editorial', 'myscore24-desk', 'Editorial Team', NULL, 'Official MyScore24 Football News & Analysis Desk', NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);
    `)
    console.log('✅ Seeded default author.')

    console.log('🎉 CMS Database initialization complete!')
  } catch (error) {
    console.error('❌ Error during CMS DB initialization:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
