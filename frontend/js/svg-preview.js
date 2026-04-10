const SVGPreview = {
  render(containerId, partConfig) {
    const svg = document.getElementById(containerId);
    if (!svg) return;

    const { baseShape, dimensions, walls } = partConfig;
    if (!dimensions.length || !dimensions.width) {
      svg.innerHTML = `<text x="200" y="150" text-anchor="middle" 
        style="fill:#888;font-size:14px">
        Enter dimensions to see preview</text>`;
      return;
    }

    const padding = 40;
    const maxW = 360;
    const maxH = 220;
    const scaleX = maxW / dimensions.length;
    const scaleY = maxH / dimensions.width;
    const scale = Math.min(scaleX, scaleY, 2);

    const W = dimensions.length * scale;
    const H = dimensions.width * scale;
    const offX = (400 - W) / 2;
    const offY = (300 - H) / 2;

    let svgContent = '';

    svgContent += `<rect x="${offX}" y="${offY}" 
      width="${W}" height="${H}" 
      fill="#e8f4fd" stroke="#2563eb" 
      stroke-width="1.5" rx="2"/>`;

    const wallLabels = getWallLabels(baseShape);
    svgContent += renderWallLabels(wallLabels, offX, offY, W, H);
    svgContent += renderHoles(walls, offX, offY, W, H, 
                              dimensions, scale);
    svgContent += renderBends(walls, offX, offY, W, H, 
                              dimensions, scale);
    svgContent += renderDimensions(dimensions, offX, offY, W, H);

    svg.innerHTML = svgContent;
  }
};

function getWallLabels(baseShape) {
  return {
    top: 'Top',
    front: 'Front',
    back: 'Back',
    left: 'Left',
    right: 'Right'
  };
}

function renderWallLabels(labels, offX, offY, W, H) {
  return `
    <text x="${offX + W/2}" y="${offY - 8}" 
      text-anchor="middle" 
      style="fill:#2563eb;font-size:10px;font-weight:500">
      Top
    </text>
    <text x="${offX + W/2}" y="${offY + H + 16}" 
      text-anchor="middle" 
      style="fill:#2563eb;font-size:10px;font-weight:500">
      Front
    </text>
    <text x="${offX - 8}" y="${offY + H/2}" 
      text-anchor="end" 
      style="fill:#2563eb;font-size:10px;font-weight:500">
      Left
    </text>
    <text x="${offX + W + 8}" y="${offY + H/2}" 
      text-anchor="start" 
      style="fill:#2563eb;font-size:10px;font-weight:500">
      Right
    </text>
  `;
}

function renderHoles(walls, offX, offY, W, H, dimensions, scale) {
  let html = '';
  if (!walls) return html;

  const wallOffsets = {
    front: { baseX: offX, baseY: offY },
    back:  { baseX: offX, baseY: offY },
    left:  { baseX: offX, baseY: offY },
    right: { baseX: offX, baseY: offY },
    top:   { baseX: offX, baseY: offY }
  };

  for (const [wallName, wall] of Object.entries(walls)) {
    if (!wall.holes) continue;
    for (const hole of wall.holes) {
      if (!hole.diameter || !hole.fromLeft || !hole.fromBottom) continue;
      const cx = offX + (hole.fromLeft * scale);
      const cy = offY + H - (hole.fromBottom * scale);
      const r = (hole.diameter / 2) * scale;
      const qty = hole.qty || 1;

      html += `<circle cx="${cx}" cy="${cy}" r="${Math.max(r, 3)}" 
        fill="white" stroke="#e74c3c" stroke-width="1.5"/>`;

      if (qty > 1) {
        html += `<text x="${cx}" y="${cy + 3}" 
          text-anchor="middle" 
          style="fill:#e74c3c;font-size:9px">
          ×${qty}
        </text>`;
      }
    }
  }
  return html;
}

function renderBends(walls, offX, offY, W, H, dimensions, scale) {
  let html = '';
  if (!walls) return html;

  for (const [wallName, wall] of Object.entries(walls)) {
    if (!wall.bends) continue;
    for (const bend of wall.bends) {
      if (!bend.distanceFromBottom) continue;
      const y = offY + H - (bend.distanceFromBottom * scale);
      html += `
        <line x1="${offX}" y1="${y}" 
              x2="${offX + W}" y2="${y}" 
              stroke="#f39c12" stroke-width="1.5" 
              stroke-dasharray="6,3"/>
        <text x="${offX + W + 4}" y="${y + 4}" 
          style="fill:#f39c12;font-size:9px">
          ${bend.angle}°
        </text>`;
    }
  }
  return html;
}

function renderDimensions(dimensions, offX, offY, W, H) {
  return `
    <line x1="${offX}" y1="${offY + H + 25}" 
          x2="${offX + W}" y2="${offY + H + 25}" 
          stroke="#999" stroke-width="0.5"/>
    <text x="${offX + W/2}" y="${offY + H + 35}" 
      text-anchor="middle" 
      style="fill:#666;font-size:10px">
      ${dimensions.length}mm
    </text>
    <line x1="${offX - 25}" y1="${offY}" 
          x2="${offX - 25}" y2="${offY + H}" 
          stroke="#999" stroke-width="0.5"/>
    <text x="${offX - 30}" y="${offY + H/2}" 
      text-anchor="middle" 
      transform="rotate(-90,${offX - 30},${offY + H/2})"
      style="fill:#666;font-size:10px">
      ${dimensions.width}mm
    </text>
  `;
}