const calculateParametricGeometry = (partConfig) => {
  const { baseShape, dimensions, walls } = partConfig;

  let basePerimeter = 0;
  let totalHolePerimeter = 0;
  let totalBends = 0;
  let totalFlangeLength = 0;

  if (baseShape === 'rectangle') {
    basePerimeter = 2 * (dimensions.length + dimensions.width);
  } else if (baseShape === 'l-shape') {
    basePerimeter = 2 * (dimensions.length + dimensions.width) -
                   2 * (dimensions.cutLength + dimensions.cutWidth);
  } else if (baseShape === 'u-channel') {
    basePerimeter = 2 * dimensions.height +
                   dimensions.baseWidth +
                   2 * dimensions.flangeWidth;
  }

  for (const [wallName, wall] of Object.entries(walls)) {
    if (wall.holes) {
      for (const hole of wall.holes) {
        let holePeri = 0;
        if (hole.type === 'circular') {
          holePeri = Math.PI * hole.diameter;
        } else if (hole.type === 'slot') {
          holePeri = 2 * hole.length +
                     Math.PI * hole.width;
        } else if (hole.type === 'square') {
          holePeri = 2 * (hole.length + hole.width);
        }
        totalHolePerimeter += holePeri * (hole.qty || 1);
      }
    }

    if (wall.bends) {
      for (const bend of wall.bends) {
        totalBends++;
        totalFlangeLength += bend.flangeLength || 0;
      }
    }
  }

  const totalCuttingLength = parseFloat(
    (basePerimeter + totalHolePerimeter).toFixed(2)
  );

  const flatBlankLength = parseFloat(
    (dimensions.length + totalFlangeLength).toFixed(2)
  );

  const flatBlankWidth = parseFloat(
    dimensions.width.toFixed(2)
  );

  return {
    basePerimeter: parseFloat(basePerimeter.toFixed(2)),
    totalHolePerimeter: parseFloat(totalHolePerimeter.toFixed(2)),
    totalCuttingLength,
    flatBlankLength,
    flatBlankWidth,
    boundingBoxWidth: flatBlankLength,
    boundingBoxHeight: flatBlankWidth,
    perimeter: totalCuttingLength,
    totalBends,
    wallSummary: buildWallSummary(walls)
  };
};

const buildWallSummary = (walls) => {
  const summary = [];
  for (const [wallName, wall] of Object.entries(walls)) {
    let holePeri = 0;
    let holeCount = 0;
    let bendCount = 0;

    if (wall.holes) {
      for (const hole of wall.holes) {
        holeCount += hole.qty || 1;
        if (hole.type === 'circular') {
          holePeri += Math.PI * hole.diameter * (hole.qty || 1);
        } else if (hole.type === 'slot') {
          holePeri += (2 * hole.length + Math.PI * hole.width) *
                      (hole.qty || 1);
        } else if (hole.type === 'square') {
          holePeri += 2 * (hole.length + hole.width) * (hole.qty || 1);
        }
      }
    }

    if (wall.bends) {
      bendCount = wall.bends.length;
    }

    summary.push({
      wall: wallName,
      holeCount,
      cuttingAdded: parseFloat(holePeri.toFixed(2)),
      bendCount
    });
  }
  return summary;
};

const generateFabricationNotes = (partConfig, geometry) => {
  const { baseShape, dimensions, walls } = partConfig;
  const lines = [];

  lines.push(`BASE SHAPE: ${baseShape.toUpperCase()}`);
  lines.push(
    `FLAT BLANK: ${geometry.flatBlankLength}mm × ` +
    `${geometry.flatBlankWidth}mm`
  );
  lines.push('');
  lines.push('CUTTING OPERATIONS:');
  lines.push(`  Base outline: ${geometry.basePerimeter}mm`);

  for (const [wallName, wall] of Object.entries(walls)) {
    if (wall.holes && wall.holes.length > 0) {
      for (const hole of wall.holes) {
        const qty = hole.qty || 1;
        if (hole.type === 'circular') {
          lines.push(
            `  ${wallName} — ${qty}x circular hole ` +
            `⌀${hole.diameter}mm at ` +
            `(${hole.fromLeft},${hole.fromBottom})`
          );
        } else if (hole.type === 'slot') {
          lines.push(
            `  ${wallName} — ${qty}x slot ` +
            `${hole.length}×${hole.width}mm at ` +
            `(${hole.fromLeft},${hole.fromBottom})`
          );
        } else if (hole.type === 'square') {
          lines.push(
            `  ${wallName} — ${qty}x square cutout ` +
            `${hole.length}×${hole.width}mm at ` +
            `(${hole.fromLeft},${hole.fromBottom})`
          );
        }
      }
    }
  }

  lines.push(`  Total cutting length: ${geometry.totalCuttingLength}mm`);
  lines.push('');
  lines.push('BENDING OPERATIONS:');

  let bendIndex = 1;
  for (const [wallName, wall] of Object.entries(walls)) {
    if (wall.bends && wall.bends.length > 0) {
      for (const bend of wall.bends) {
        lines.push(
          `  Bend ${bendIndex}: ${wallName}, ` +
          `${bend.distanceFromBottom}mm from bottom, ` +
          `${bend.angle}° ${bend.direction}, ` +
          `${bend.flangeLength}mm flange`
        );
        bendIndex++;
      }
    }
  }

  if (bendIndex === 1) {
    lines.push('  No bending operations');
  }

  return lines.join('\n');
};

module.exports = {
  calculateParametricGeometry,
  generateFabricationNotes
};