// Hearth Ledger — small SVG charts, drawn from numbers, no libraries.
// donutChart(parts) takes [{label, value, color}] and returns an SVG string
// for a ring chart; barsChart(series) takes [{label, value}] and returns a
// vertical bar chart. Both are pure functions of their inputs.

const TAU = Math.PI * 2;

function polar(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(cx, cy, rOuter, rInner, a0, a1) {
  const [x0, y0] = polar(cx, cy, rOuter, a0);
  const [x1, y1] = polar(cx, cy, rOuter, a1);
  const [x2, y2] = polar(cx, cy, rInner, a1);
  const [x3, y3] = polar(cx, cy, rInner, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${x3.toFixed(1)} ${y3.toFixed(1)} Z`;
}

export function donutChart(parts) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const cx = 110;
  const cy = 110;
  const outer = 96;
  const inner = 58;
  let angle = -Math.PI / 2;
  const slices = [];
  for (const p of parts) {
    if (p.value <= 0) continue;
    const span = (p.value / total) * TAU;
    const end = angle + span;
    // Leave a hairline gap between slices so neighbours stay readable.
    const gap = 0.012;
    slices.push(
      `<path d="${arcPath(cx, cy, outer, inner, angle + gap, end - gap)}" fill="${p.color}"><title>${p.label}: $${p.value.toFixed(2)}</title></path>`,
    );
    angle = end;
  }
  const legend = parts
    .map(
      (p) =>
        `<li><span class="swatch" style="background:${p.color}"></span>${p.label}<b>$${p.value.toFixed(2)}</b><span class="pct">${((p.value / total) * 100).toFixed(1)}%</span></li>`,
    )
    .join("");
  return `<div class="donut-wrap"><svg viewBox="0 0 220 220" role="img" aria-label="Spending by category, donut chart">${slices.join("")}<text x="110" y="104" text-anchor="middle" class="donut-total">$${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text><text x="110" y="126" text-anchor="middle" class="donut-caption">spent in November</text></svg><ul class="legend">${legend}</ul></div>`;
}

export function barsChart(series) {
  const width = 640;
  const height = 260;
  const padLeft = 56;
  const padBottom = 30;
  const padTop = 26;
  const max = Math.max(...series.map((s) => s.value), 1);
  const plotW = width - padLeft - 8;
  const plotH = height - padTop - padBottom;
  const slot = plotW / series.length;
  const barW = Math.min(46, slot * 0.6);
  const bars = series.map((s, i) => {
    const h = (s.value / max) * plotH;
    const x = padLeft + i * slot + (slot - barW) / 2;
    const y = padTop + plotH - h;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="4" fill="${s.color || "#2e6b4f"}"><title>${s.label}: $${s.value.toFixed(2)}</title></rect><text x="${(x + barW / 2).toFixed(1)}" y="${(padTop + plotH + 18).toFixed(1)}" text-anchor="middle" class="bar-label">${s.label}</text><text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" class="bar-value">$${Math.round(s.value).toLocaleString("en-US")}</text>`;
  });
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const y = padTop + plotH * (1 - f);
    return `<line x1="${padLeft}" y1="${y.toFixed(1)}" x2="${width - 8}" y2="${y.toFixed(1)}" class="grid-line"/><text x="${padLeft - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" class="grid-label">$${Math.round(max * f).toLocaleString("en-US")}</text>`;
  });
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Spending by category, bar chart" class="bars-svg">${grid.join("")}${bars.join("")}</svg>`;
}

// A thin horizontal bar used for budget rows and goal progress.
export function meter(fraction, tone) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return `<div class="meter" role="img" aria-label="${pct.toFixed(0)} percent"><span class="meter-fill ${tone || ""}" style="width:${pct.toFixed(1)}%"></span></div>`;
}
