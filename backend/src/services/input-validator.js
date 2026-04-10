const MAX_THICKNESS = {
  steel: 20,
  aluminium: 12,
  copper: 8,
};

const MAX_BOUNDING_BOX_WIDTH = 2000;
const MAX_BOUNDING_BOX_HEIGHT = 1500;
const MAX_BENDS = 12;

const validateOrder = (inputs, geometry) => {
  const errors = [];
  const { material, thickness, bends, finish } = inputs;
  const { boundingBoxWidth, boundingBoxHeight } = geometry;

  if (!thickness || thickness <= 0) {
    errors.push('Thickness must be greater than 0.');
  }

  const maxThickness = MAX_THICKNESS[material];
  if (maxThickness !== undefined && thickness > maxThickness) {
    errors.push(`Maximum thickness for ${material} is ${maxThickness}mm.`);
  }

  if (boundingBoxWidth > MAX_BOUNDING_BOX_WIDTH || boundingBoxHeight > MAX_BOUNDING_BOX_HEIGHT) {
    errors.push(`Bounding box must not exceed ${MAX_BOUNDING_BOX_WIDTH} x ${MAX_BOUNDING_BOX_HEIGHT}mm.`);
  }

  if (bends > MAX_BENDS) {
    errors.push(`Maximum number of bends is ${MAX_BENDS}.`);
  }

  if (finish === 'galvanize' && material === 'aluminium') {
    errors.push('Galvanizing is not available for aluminium.');
  }

  return {
    feasible: errors.length === 0,
    errors,
  };
};

module.exports = { validateOrder };
