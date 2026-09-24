const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
console.log(Object.keys(p).filter(k => !k.startsWith('$') && !k.startsWith('_')))
p.$disconnect()
