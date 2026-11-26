// Hearth Ledger — charts drawn on canvas, no library, no network.
// Each chart reads only the numbers it is handed, and sizes itself to the
// element on the page (with device-pixel-ratio scaling so it stays sharp).

function setupCanvas(canvas, heightCss) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = heightCss;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

// A donut: slices of {label, value, color}, with the total in the middle.
export function drawDonut(canvas, slices, centerLabel, centerValue) {
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 12;
  const inner = outer * 0.62;
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) {
    ctx.fillStyle = '#e5ddd0';
    ctx.beginPath(); ctx.arc(cx, cy, outer, 0, Math.PI * 2); ctx.fill();
  } else {
    let start = -Math.PI / 2;
    for (const s of slices) {
      const sweep = (s.value / total) * Math.PI * 2;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, outer, start, start + sweep);
      ctx.closePath(); ctx.fill();
      start += sweep;
    }
  }
  ctx.fillStyle = '#fffdf8';
  ctx.beginPath(); ctx.arc(cx, cy, inner, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b6257';
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(centerLabel, cx, cy - 4);
  ctx.fillStyle = '#1f2a24';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(centerValue, cx, cy + 20);
}

// Horizontal bars: rows of {label, value, color} with the value at the end.
export function drawBars(canvas, rows, money) {
  const rowH = 34;
  const height = rows.length * rowH + 8;
  const { ctx, width } = setupCanvas(canvas, height);
  const labelW = 132;
  const valueW = 76;
  const barX = labelW + 8;
  const barW = Math.max(40, width - barX - valueW - 8);
  const max = Math.max(...rows.map((r) => r.value), 1);
  ctx.font = '12px system-ui, sans-serif';
  rows.forEach((row, i) => {
    const y = 8 + i * rowH;
    ctx.fillStyle = '#1f2a24';
    ctx.textAlign = 'left';
    ctx.fillText(row.label, 0, y + 15);
    ctx.fillStyle = '#efe9dd';
    ctx.fillRect(barX, y, barW, 18);
    ctx.fillStyle = row.color;
    ctx.fillRect(barX, y, Math.max(2, (row.value / max) * barW), 18);
    ctx.fillStyle = '#1f2a24';
    ctx.textAlign = 'right';
    ctx.fillText(money(row.value), width, y + 15);
  });
}

// Grouped bars: two series (income, spent) across months.
export function drawTrend(canvas, months, income, spent, money) {
  const height = 230;
  const { ctx, width } = setupCanvas(canvas, height);
  const padL = 46;
  const padB = 28;
  const padT = 12;
  const plotW = width - padL - 8;
  const plotH = height - padT - padB;
  const max = Math.max(...income, ...spent, 1000);
  const top = Math.ceil(max / 1000) * 1000;
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#8a8073';
  ctx.textAlign = 'right';
  for (let g = 0; g <= 4; g++) {
    const v = (top / 4) * g;
    const y = padT + plotH - (v / top) * plotH;
    ctx.strokeStyle = '#e8e1d3';
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(width - 8, y); ctx.stroke();
    ctx.fillText('$' + (v / 1000).toFixed(0) + 'k', padL - 6, y + 4);
  }
  const slot = plotW / months.length;
  const bw = Math.min(26, slot / 3);
  months.forEach((m, i) => {
    const x0 = padL + i * slot + slot / 2;
    const ih = (income[i] / top) * plotH;
    const sh = (spent[i] / top) * plotH;
    ctx.fillStyle = '#1f4d3a';
    ctx.fillRect(x0 - bw - 2, padT + plotH - ih, bw, ih);
    ctx.fillStyle = '#e8a33d';
    ctx.fillRect(x0 + 2, padT + plotH - sh, bw, sh);
    ctx.fillStyle = '#1f2a24';
    ctx.textAlign = 'center';
    ctx.fillText(m, x0, height - 8);
  });
  void money;
}
