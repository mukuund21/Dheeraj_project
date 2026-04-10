const { calculateParametricGeometry, generateFabricationNotes } = require('../services/parametric-geometry');
const { success, error } = require('../utils/api-response');

const getParametricGeometry = async (req, res, next) => {
  try {
    const { baseShape, dimensions, walls } = req.body;

    if (!baseShape || !dimensions || !walls) {
      return error(res, 'baseShape, dimensions and walls are required', 400);
    }

    const geometry = calculateParametricGeometry({ baseShape, dimensions, walls });
    const fabricationNotes = generateFabricationNotes({ baseShape, dimensions, walls }, geometry);

    return success(res, { geometry, fabricationNotes }, 'Geometry calculated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getParametricGeometry };