const chartData = [
  { label: "English", value: 50, color: "var(--sv-crimson)" },
  { label: "Thai", value: 50, color: "var(--sv-deep)" },
  { label: "Chinese & Activities", value: 25, color: "#e5cd77" }
];
const total = chartData.reduce((sum, item) => sum + item.value, 0);
let currentAngle = 0;

const gradients = chartData.map(item => {
  const percentage = (item.value / total) * 100;
  const start = currentAngle;
  currentAngle += percentage;
  return `${item.color} ${start}% ${currentAngle}%`;
}).join(", ");

console.log(`background: conic-gradient(${gradients});`);
