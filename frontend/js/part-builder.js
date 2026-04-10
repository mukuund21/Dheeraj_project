const WALLS = ['top', 'front', 'back', 'left', 'right'];
let activeWall = 'front';
let partState = {
  baseShape: 'rectangle',
  dimensions: { length: 0, width: 0 },
  walls: {}
};

WALLS.forEach(w => { partState.walls[w] = { holes: [], bends: [] }; });

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'login.html'; return; }
  renderWallTabs();
  renderWallContent();
});

function onShapeChange() {
  partState.baseShape = document.getElementById('base-shape').value;
  updatePreview();
}

function renderWallTabs() {
  const tabs = document.getElementById('wall-tabs');
  tabs.innerHTML = WALLS.map(w => `
    <button class="wall-tab ${w === activeWall ? 'active' : ''}" 
            onclick="switchWall('${w}')">
      ${w.charAt(0).toUpperCase() + w.slice(1)}
    </button>
  `).join('');
}

function switchWall(wall) {
  activeWall = wall;
  renderWallTabs();
  renderWallContent();
}

function renderWallContent() {
  const content = document.getElementById('wall-content');
  const wall = partState.walls[activeWall];

  let html = `
    <div class="wall-section">
      <div class="wall-section-header">
        <h4>Holes on ${activeWall} wall</h4>
        <button class="btn-small" onclick="addHole()">+ Add hole</button>
      </div>
      <div id="holes-list">`;

  wall.holes.forEach((hole, i) => {
    html += renderHoleRow(hole, i);
  });

  html += `</div></div>
    <div class="wall-section">
      <div class="wall-section-header">
        <h4>Bends on ${activeWall} wall</h4>
        <button class="btn-small" onclick="addBend()">+ Add bend</button>
      </div>
      <div id="bends-list">`;

  wall.bends.forEach((bend, i) => {
    html += renderBendRow(bend, i);
  });

  html += `</div></div>`;
  content.innerHTML = html;
}

function renderHoleRow(hole, index) {
  return `
    <div class="hole-row" id="hole-${index}">
      <div class="form-row">
        <div class="form-group">
          <label>Type</label>
          <select onchange="updateHole(${index},'type',this.value)">
            <option ${hole.type==='circular'?'selected':''}>circular</option>
            <option ${hole.type==='slot'?'selected':''}>slot</option>
            <option ${hole.type==='square'?'selected':''}>square</option>
          </select>
        </div>
        <div class="form-group">
          <label>Diameter (mm)</label>
          <input type="number" value="${hole.diameter||''}" 
            placeholder="e.g. 10"
            onchange="updateHole(${index},'diameter',+this.value)">
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input type="number" value="${hole.qty||1}" min="1"
            onchange="updateHole(${index},'qty',+this.value)">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>From left edge (mm)</label>
          <input type="number" value="${hole.fromLeft||''}" 
            placeholder="e.g. 20"
            onchange="updateHole(${index},'fromLeft',+this.value)">
        </div>
        <div class="form-group">
          <label>From bottom edge (mm)</label>
          <input type="number" value="${hole.fromBottom||''}" 
            placeholder="e.g. 15"
            onchange="updateHole(${index},'fromBottom',+this.value)">
        </div>
        <div class="form-group">
          <label>&nbsp;</label>
          <button class="btn-remove" onclick="removeHole(${index})">
            Remove
          </button>
        </div>
      </div>
    </div>`;
}

function renderBendRow(bend, index) {
  return `
    <div class="bend-row" id="bend-${index}">
      <div class="form-row">
        <div class="form-group">
          <label>Distance from bottom (mm)</label>
          <input type="number" value="${bend.distanceFromBottom||''}" 
            placeholder="e.g. 40"
            onchange="updateBend(${index},'distanceFromBottom',+this.value)">
        </div>
        <div class="form-group">
          <label>Angle (degrees)</label>
          <input type="number" value="${bend.angle||90}" 
            placeholder="e.g. 90"
            onchange="updateBend(${index},'angle',+this.value)">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Direction</label>
          <select onchange="updateBend(${index},'direction',this.value)">
            <option ${bend.direction==='up'?'selected':''}>up</option>
            <option ${bend.direction==='down'?'selected':''}>down</option>
          </select>
        </div>
        <div class="form-group">
          <label>Flange length (mm)</label>
          <input type="number" value="${bend.flangeLength||''}" 
            placeholder="e.g. 20"
            onchange="updateBend(${index},'flangeLength',+this.value)">
        </div>
        <div class="form-group">
          <label>&nbsp;</label>
          <button class="btn-remove" onclick="removeBend(${index})">
            Remove
          </button>
        </div>
      </div>
    </div>`;
}

function addHole() {
  partState.walls[activeWall].holes.push({
    type: 'circular', diameter: '', 
    fromLeft: '', fromBottom: '', qty: 1
  });
  renderWallContent();
}

function addBend() {
  partState.walls[activeWall].bends.push({
    distanceFromBottom: '', angle: 90, 
    direction: 'up', flangeLength: ''
  });
  renderWallContent();
}

function updateHole(index, field, value) {
  partState.walls[activeWall].holes[index][field] = value;
  updatePreview();
}

function updateBend(index, field, value) {
  partState.walls[activeWall].bends[index][field] = value;
  updatePreview();
}

function removeHole(index) {
  partState.walls[activeWall].holes.splice(index, 1);
  renderWallContent();
  updatePreview();
}

function removeBend(index) {
  partState.walls[activeWall].bends.splice(index, 1);
  renderWallContent();
  updatePreview();
}

function updatePreview() {
  const length = +document.getElementById('dim-length').value;
  const width = +document.getElementById('dim-width').value;
  partState.dimensions = { length, width };
  partState.baseShape = document.getElementById('base-shape').value;

  if (length > 0 && width > 0) {
    SVGPreview.render('part-preview', partState);
    updateSummary();
  }
}

function updateSummary() {
  const { dimensions, walls } = partState;
  if (!dimensions.length || !dimensions.width) return;

  const basePerimeter = 2 * (dimensions.length + dimensions.width);
  let holePeri = 0;
  let totalBends = 0;
  let totalFlange = 0;

  for (const wall of Object.values(walls)) {
    for (const hole of wall.holes) {
      if (hole.diameter) {
        holePeri += Math.PI * hole.diameter * (hole.qty || 1);
      }
    }
    for (const bend of wall.bends) {
      totalBends++;
      totalFlange += bend.flangeLength || 0;
    }
  }

  const totalCutting = basePerimeter + holePeri;
  const flatBlankL = dimensions.length + totalFlange;

  document.getElementById('s-cutting').textContent = 
    totalCutting.toFixed(2) + 'mm';
  document.getElementById('s-blank').textContent = 
    `${flatBlankL}mm × ${dimensions.width}mm`;
  document.getElementById('s-bends').textContent = totalBends;
  document.getElementById('s-holes').textContent = 
    holePeri.toFixed(2) + 'mm';
  document.getElementById('geometry-summary').style.display = 'block';

  updateWallSummaryTable();
}

function updateWallSummaryTable() {
  const tbody = document.getElementById('wall-summary-body');
  if (!tbody) return;

  let rows = '';
  for (const [wallName, wall] of Object.entries(partState.walls)) {
    let holePeri = 0;
    let holeCount = 0;
    for (const hole of wall.holes) {
      if (hole.diameter) {
        holeCount += hole.qty || 1;
        holePeri += Math.PI * hole.diameter * (hole.qty || 1);
      }
    }
    rows += `
      <tr>
        <td>${wallName}</td>
        <td>${holeCount}</td>
        <td>${holePeri.toFixed(2)}mm</td>
        <td>${wall.bends.length}</td>
      </tr>`;
  }
  tbody.innerHTML = rows;
  document.getElementById('wall-summary-section').style.display = 'block';
}

async function proceedToQuote() {
  const errorDiv = document.getElementById('builder-error');
  errorDiv.style.display = 'none';

  const length = +document.getElementById('dim-length').value;
  const width = +document.getElementById('dim-width').value;

  if (!length || !width) {
    errorDiv.textContent = 'Please enter length and width dimensions.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/parametric', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(partState)
    });

    const result = await response.json();

    if (!result.success) {
      errorDiv.textContent = result.error;
      errorDiv.style.display = 'block';
      return;
    }

    sessionStorage.setItem('parametricGeometry', 
      JSON.stringify(result.data.geometry));
    sessionStorage.setItem('fabricationNotes', 
      result.data.fabricationNotes);
    sessionStorage.setItem('partConfig', JSON.stringify(partState));
    sessionStorage.setItem('uploadMode', 'parametric');

    window.location.href = 'configure.html';
  } catch (err) {
    errorDiv.textContent = 'Failed to calculate geometry. Try again.';
    errorDiv.style.display = 'block';
  }
}

function resetBuilder() {
  WALLS.forEach(w => {
    partState.walls[w] = { holes: [], bends: [] };
  });
  document.getElementById('dim-length').value = '';
  document.getElementById('dim-width').value = '';
  renderWallContent();
  document.getElementById('geometry-summary').style.display = 'none';
  document.getElementById('wall-summary-section').style.display = 'none';
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}