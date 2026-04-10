const { getPendingUpload } = require('../utils/upload-store');
const { validateOrder } = require('../services/input-validator');
const { calculateQuote } = require('../services/quote-calculator');
const { success, error } = require('../utils/api-response');

const getQuote = async (req, res, next) => {
  try {
    const { fileId, material, thickness, quantity, bends, bendAngle, finish } = req.body;

    if (!fileId || !material || thickness == null || !quantity || bends == null || bendAngle == null || !finish) {
      return error(res, 'Missing required fields: fileId, material, thickness, quantity, bends, bendAngle, finish', 400);
    }

    const pending = getPendingUpload(fileId);
    if (!pending) {
      return error(res, 'Uploaded file not found. Please upload your DXF file again.', 404);
    }

    const geometry = pending.geometry;

    const inputs = {
      material,
      thickness: parseFloat(thickness),
      quantity: parseInt(quantity, 10),
      bends: parseInt(bends, 10),
      bendAngle: parseFloat(bendAngle),
      finish,
    };

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

module.exports = { getQuote };
