const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const pricingDefaults = [
  { key: 'MATERIAL_RATE_STEEL', value: '0.08' },
  { key: 'MATERIAL_RATE_ALUMINIUM', value: '0.12' },
  { key: 'MATERIAL_RATE_COPPER', value: '0.18' },
  { key: 'CUTTING_RATE_PER_MM', value: '0.05' },
  { key: 'BEND_COST_BASE', value: '2.50' },
  { key: 'BEND_ANGLE_MULTIPLIER', value: '0.02' },
  { key: 'FINISH_RATE_POWDER_COAT', value: '0.04' },
  { key: 'FINISH_RATE_GALVANIZE', value: '0.06' },
  { key: 'FINISH_RATE_ZINC_PLATE', value: '0.05' },
  { key: 'FINISH_RATE_NONE', value: '0' },
  { key: 'MARGIN_PERCENT', value: '20' },
  { key: 'BULK_DISCOUNT_10', value: '5' },
  { key: 'BULK_DISCOUNT_50', value: '10' },
  { key: 'LEAD_TIME_BASE_DAYS', value: '5' },
  { key: 'LEAD_TIME_PER_BEND', value: '1' },
];

const seedPricingConfig = async () => {
  for (const entry of pricingDefaults) {
    await prisma.pricingConfig.upsert({
      where: { key: entry.key },
      update: { value: entry.value },
      create: entry,
    });
  }
};

const main = async () => {
  await seedPricingConfig();
  console.log('Seed complete.');
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
