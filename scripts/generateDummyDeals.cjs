// scripts/generateDummyDeals.cjs

;(async () => {
  const { PrismaClient } = require('@prisma/client');
  const { faker } = require('@faker-js/faker');
  const prisma = new PrismaClient();

  try {
    // generate 10 fake deals
    for (let i = 0; i < 10; i++) {
      await prisma.deal.create({
        data: {
          brokerage:     faker.company.name(),
          dealCaption:   faker.lorem.sentence(),
          revenue:       parseFloat(faker.finance.amount(1e6, 1e8, 2)),
          ebitda:        parseFloat(faker.finance.amount(1e5, 1e7, 2)),
          ebitdaMargin:  parseFloat(faker.finance.amount(0, 50, 2)),
          industry:      faker.commerce.department(),
          sourceWebsite: faker.internet.url(),
          title:         faker.lorem.words(3),
          description:   faker.lorem.paragraph(),
          publishedAt:   faker.date.recent(),
        },
      });
    }

    console.log('✔ Inserted 10 dummy deals');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
