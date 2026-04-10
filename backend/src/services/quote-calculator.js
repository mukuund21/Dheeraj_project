const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const loadPricingConfig = async () => {
  const entries = await prisma.pricingConfig.findMany();
  const config = {};
  for (const entry of entries) {
    config[entry.key] = parseFloat(entry.value);
  }
  return config;
};

const getMaterialRate = (config, material) => {
  const key = `MATERIAL_RATE_${material.toUpperCase()}`;
  return config[key];
};

const getFinishRate = (config, finish) => {
  const key = `FINISH_RATE_${finish.toUpperCase()}`;
  return config[key];
};

const getBulkDiscount = (config, quantity) => {
  if (quantity >= 50) return config['BULK_DISCOUNT_50'];
  if (quantity >= 10) return config['BULK_DISCOUNT_10'];
  return 0;
};

const calculateQuote = async (geometry, inputs) => {
  const config = await loadPricingConfig();

  const { perimeter, boundingBoxWidth, boundingBoxHeight } = geometry;
  const { material, thickness, quantity, bends, bendAngle, finish } = inputs;

  const materialRate = getMaterialRate(config, material);
  const cuttingRate = config['CUTTING_RATE_PER_MM'];
  const bendBase = config['BEND_COST_BASE'];
  const bendMultiplier = config['BEND_ANGLE_MULTIPLIER'];
  const finishRate = getFinishRate(config, finish);
  const marginPercent = config['MARGIN_PERCENT'];
  const baseDays = config['LEAD_TIME_BASE_DAYS'];
  const perBendDays = config['LEAD_TIME_PER_BEND'];

  const area = (boundingBoxWidth * boundingBoxHeight) / 100;
  const materialCost = area * thickness * materialRate;
  const cuttingCost = perimeter * cuttingRate;
  const bendingCost = bends * bendBase * (1 + bendAngle * bendMultiplier);
  const finishingCost = area * finishRate;
  const subtotal = materialCost + cuttingCost + bendingCost + finishingCost;
  const margin = subtotal * (marginPercent / 100);
  const unitPrice = subtotal + margin;
  const bulkDiscount = getBulkDiscount(config, quantity);
  const totalPrice = unitPrice * quantity * (1 - bulkDiscount / 100);
  const leadTime = baseDays + bends * perBendDays;

  return {
    materialCost,
    cuttingCost,
    bendingCost,
    finishingCost,
    subtotal,
    margin,
    unitPrice,
    bulkDiscount,
    totalPrice,
    leadTime,
    quantity,
  };
};

module.exports = { calculateQuote };
