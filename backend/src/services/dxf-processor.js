const fs = require('fs');
const DxfParser = require('dxf-parser');

const getLineLength = (entity) => {
  const dx = entity.vertices[1].x - entity.vertices[0].x;
  const dy = entity.vertices[1].y - entity.vertices[0].y;
  return Math.sqrt(dx * dx + dy * dy);
};

const getArcLength = (entity) => {
  let startAngle = entity.startAngle;
  let endAngle = entity.endAngle;
  if (endAngle < startAngle) endAngle += 2 * Math.PI;
  return entity.radius * (endAngle - startAngle);
};

const getCircleLength = (entity) => {
  return 2 * Math.PI * entity.radius;
};

const getPolylineLength = (entity) => {
  let length = 0;
  const verts = entity.vertices;
  for (let i = 0; i < verts.length - 1; i++) {
    const dx = verts[i + 1].x - verts[i].x;
    const dy = verts[i + 1].y - verts[i].y;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (verts[i].bulge) {
      const b = Math.abs(verts[i].bulge);
      const angle = 4 * Math.atan(b);
      const radius = segLen / (2 * Math.sin(angle / 2));
      length += radius * angle;
    } else {
      length += segLen;
    }
  }
  if (entity.shape) {
    const dx = verts[0].x - verts[verts.length - 1].x;
    const dy = verts[0].y - verts[verts.length - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

const getSplineLength = (entity) => {
  const points = entity.controlPoints || entity.fitPoints || [];
  if (points.length < 2) return 0;
  let length = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
};

const updateBounds = (bounds, x, y) => {
  if (x < bounds.minX) bounds.minX = x;
  if (x > bounds.maxX) bounds.maxX = x;
  if (y < bounds.minY) bounds.minY = y;
  if (y > bounds.maxY) bounds.maxY = y;
};

const parseDXF = async (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileContent);

  let perimeter = 0;
  let entityCount = 0;
  const bounds = {
    minX: Infinity, maxX: -Infinity,
    minY: Infinity, maxY: -Infinity
  };

  for (const entity of dxf.entities) {
    entityCount++;

    if (entity.type === 'LINE') {
      perimeter += getLineLength(entity);
      updateBounds(bounds, entity.vertices[0].x, entity.vertices[0].y);
      updateBounds(bounds, entity.vertices[1].x, entity.vertices[1].y);
    }

    else if (entity.type === 'ARC') {
      perimeter += getArcLength(entity);
      updateBounds(bounds, entity.center.x - entity.radius, entity.center.y - entity.radius);
      updateBounds(bounds, entity.center.x + entity.radius, entity.center.y + entity.radius);
    }

    else if (entity.type === 'CIRCLE') {
      perimeter += getCircleLength(entity);
      updateBounds(bounds, entity.center.x - entity.radius, entity.center.y - entity.radius);
      updateBounds(bounds, entity.center.x + entity.radius, entity.center.y + entity.radius);
    }

    else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
      perimeter += getPolylineLength(entity);
      for (const v of entity.vertices) {
        updateBounds(bounds, v.x, v.y);
      }
    }

    else if (entity.type === 'SPLINE') {
      perimeter += getSplineLength(entity);
      const points = entity.controlPoints || entity.fitPoints || [];
      for (const p of points) {
        updateBounds(bounds, p.x, p.y);
      }
    }
  }

  const boundingBoxWidth = bounds.maxX === -Infinity ? 0 :
    parseFloat((bounds.maxX - bounds.minX).toFixed(2));
  const boundingBoxHeight = bounds.maxY === -Infinity ? 0 :
    parseFloat((bounds.maxY - bounds.minY).toFixed(2));

  return {
    perimeter: parseFloat(perimeter.toFixed(2)),
    boundingBoxWidth,
    boundingBoxHeight,
    entityCount
  };
};

module.exports = { parseDXF };