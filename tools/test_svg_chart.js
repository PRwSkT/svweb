const data = [
  { label: 'English', value: 50, color: '#e85d75' },
  { label: 'Thai', value: 50, color: '#2b3a55' },
  { label: 'Activities', value: 25, color: '#f3c677' }
];
const total = data.reduce((s, i) => s + i.value, 0);
let currentOffset = 0;
const radius = 15.9155; // 100 / (2 * PI) to make circumference = 100
const circumference = 100;

const paths = data.map((item, index) => {
  const percentage = (item.value / total) * 100;
  const strokeDasharray = `${percentage} ${100 - percentage}`;
  const strokeDashoffset = 100 - currentOffset + 25; // +25 to start at top
  currentOffset += percentage;
  return `<circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="${item.color}" stroke-width="12" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" class="chart-segment" style="animation-delay: ${index * 0.2}s" />`;
}).join('\n');

const svg = `<svg viewBox="0 0 42 42" class="donut-chart" style="width: 100%; height: 100%; border-radius: 50%; transform: rotate(0deg);">
  <circle cx="21" cy="21" r="${radius}" fill="transparent" stroke="#f0f0f0" stroke-width="12" />
  ${paths}
</svg>`;
console.log(svg);
