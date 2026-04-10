const { getPendingUpload } = require('../utils/upload-store');
const { validateOrder } = require('../services/input-validator');
const { calculateQuote } = require('../services/quote-calculator');
const { success, error } = require('../utils/api-response');

const VALID_MATERIALS = ['steel', 'aluminium', 'copper'];
const VALID_FINISHES = ['none', 'powder-coat', 'galvanize', 'anodize'];

const validateInputFields = (body, res) => {
  const { material, thickness, quantity, bends, bendAngle, finish } = body;

  if (!VALID_MATERIALS.includes(material)) {
    error(res, 'Invalid material. Must be steel, aluminium, or copper.', 400);
    return null;
  }
  if (!VALID_FINISHES.includes(finish)) {
    error(res, 'Invalid finish value.', 400);
    return null;
  }

  const parsedThickness = parseFloat(thickness);
  const parsedQuantity = parseInt(quantity, 10);
  const parsedBends = parseInt(bends, 10);
  const parsedBendAngle = parseFloat(bendAngle);

  if (isNaN(parsedThickness) || isNaN(parsedQuantity) || isNaN(parsedBends) || isNaN(parsedBendAngle)) {
    error(res, 'thickness, quantity, bends, and bendAngle must be valid numbers.', 400);
    return null;
  }
  if (parsedThickness <= 0 || parsedQuantity <= 0 || parsedBends < 0 || parsedBendAngle < 0) {
    error(res, 'thickness and quantity must be positive. bends and bendAngle must be non-negative.', 400);
    return null;
  }

  return {
    material,
    thickness: parsedThickness,
    quantity: parsedQuantity,
    bends: parsedBends,
    bendAngle: parsedBendAngle,
    finish,
  };
};

// DXF flow — geometry looked up by fileId
const getQuote = async (req, res, next) => {
  try {
    const { fileId, material, thickness, quantity, bends, bendAngle, finish } = req.body;

    if (!fileId || !material || thickness == null || !quantity || bends == null || bendAngle == null || !finish) {
      return error(res, 'Missing required fields: fileId, material, thickness, quantity, bends, bendAngle, finish', 400);
    }

    const inputs = validateInputFields(req.body, res);
    if (!inputs) return;

    const pending = getPendingUpload(fileId);
    if (!pending) {
      return error(res, 'Uploaded file not found. Please upload your DXF file again.', 404);
    }

    const geometry = pending.geometry;

    const feasibility = validateOrder(inputs, geometry);
    if (!feasibility.feasible) {
      return error(res, 'Order is not feasible', 422, feasibility.errors);
    }

    const quote = await calculateQuote(geometry, inputs);
    return success(res, quote, 'Quote calculated successfully');
  } catch (err) {
    next(err);
  }
};

// Parametric flow — geometry sent directly in request body
const getParametricQuote = async (req, res, next) => {
  try {
    const { geometry, material, thickness, quantity, bends, bendAngle, finish } = req.body;

    if (!geometry || !material || thickness == null || !quantity || bends == null || bendAngle == null || !finish) {
      return error(res, 'Missing required fields: geometry, material, thickness, quantity, bends, bendAngle, finish', 400);
    }

    if (
      typeof geometry.perimeter !== 'number' ||
      typeof geometry.boundingBoxWidth !== 'number' ||
      typeof geometry.boundingBoxHeight !== 'number'
    ) {
      return error(res, 'Invalid geometry object. Must include perimeter, boundingBoxWidth, boundingBoxHeight.', 400);
    }

    const inputs = validateInputFields(req.body, res);
    if (!inputs) return;

    const feasibility = validateOrder(inputs, geometry);
    if (!feasibility.feasible) {
      return error(res, 'Order is not feasible', 422, feasibility.errors);
    }

    const quote = await calculateQuote(geometry, inputs);
    return success(res, quote, 'Quote calculated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getQuote, getParametricQuote };
