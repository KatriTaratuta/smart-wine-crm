// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  let org = await prisma.organization.findFirst({ where: { domain: 'crm.winery1.local' } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Winery One',
        domain: 'crm.winery1.local',
        primaryColor: '#7B1FA2',
        secondaryColor: '#CE93D8',
      },
    });
  }

  const pwd = await bcrypt.hash('P@ssw0rd', 10);
  const exists = await prisma.user.findUnique({ where: { email: 'admin@winery1.local' } });
  if (!exists) {
    await prisma.user.create({
      data: {
        email: 'admin@winery1.local',
        password: pwd,
        organizationId: org.id,
        role: 'admin',
      },
    });
    console.log('Seed user created: admin@winery1.local / P@ssw0rd');
  } else {
    console.log('User already exists');
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });