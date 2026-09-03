import { getCurrencySymbol } from "./currency";

function loadLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = "/favicon.svg";
  });
}

export async function downloadAnalyticsPNG(
  periodData,
  spendingBreakdown,
  currency = "NGN",
  period = "monthly",
) {
  if (!periodData || periodData.length === 0) {
    throw new Error("There is no analytics data to export.");
  }

  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 1200;
  const padding = 70;
  const symbol = getCurrencySymbol(currency);

  const current = periodData[periodData.length - 1];

  const totalIncome = periodData.reduce(
    (total, item) => total + item.income,
    0,
  );

  const totalExpenses = periodData.reduce(
    (total, item) => total + item.expenses,
    0,
  );

  const net = current.net;

  const formatAmount = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;

  const periodLabels = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  const title = `${periodLabels[period] || "Analytics"} Overview`;

  const chartHeight = 280;
  const categoryHeight = 220;

  const height = padding + 130 + 150 + chartHeight + categoryHeight + padding;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#0f1714";
  ctx.fillRect(0, 0, width, height);

  function drawText(text, x, y, size, weight = "400", color = "#ffffff") {
    ctx.font = `${weight} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function roundedRect(x, y, w, h, radius, color) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Logo
  roundedRect(padding, 45, 58, 58, 14, "#22332b");

  ctx.drawImage(logo, padding, 45, 58, 58);

  drawText("PennyPlot", padding + 75, 80, 25, "700");

  drawText(
    "Your money, clearly plotted.",
    padding + 75,
    103,
    13,
    "400",
    "#64748b",
  );

  // Title
  drawText(title, padding, 160, 38, "700");

  drawText(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    padding,
    190,
    14,
    "400",
    "#64748b",
  );

  // Currency
  roundedRect(width - padding - 120, 55, 120, 42, 12, "#049552");

  ctx.textAlign = "center";

  drawText(currency, width - padding - 60, 82, 15, "700");

  ctx.textAlign = "left";

  // Summary cards
  const cardGap = 18;
  const cardWidth = (width - padding * 2 - cardGap * 2) / 3;

  const cards = [
    ["Income", totalIncome],
    ["Expenses", totalExpenses],
    ["Current net", net],
  ];

  cards.forEach(([label, amount], index) => {
    const x = padding + index * (cardWidth + cardGap);

    roundedRect(x, 220, cardWidth, 110, 18, "#22332b");

    drawText(label, x + 24, 255, 15, "400", "#94a3b8");

    drawText(
      formatAmount(amount),
      x + 24,
      297,
      25,
      "700",
      label === "Expenses" ? "#f87171" : "#049552",
    );
  });

  // Chart
  const chartY = 375;

  drawText("Income vs Expenses", padding, chartY, 22, "700");

  const graphX = padding;
  const graphY = chartY + 35;
  const graphWidth = width - padding * 2;
  const graphBottom = graphY + 190;

  const maxValue = Math.max(
    ...periodData.flatMap((item) => [item.income, item.expenses]),
    1,
  );

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = graphY + (190 / 4) * i;

    ctx.beginPath();
    ctx.moveTo(graphX, y);
    ctx.lineTo(graphX + graphWidth, y);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.stroke();
  }

  function drawLine(dataKey, color) {
    if (dataKey === "income") {
      ctx.strokeStyle = color;
    } else {
      ctx.strokeStyle = color;
    }

    ctx.lineWidth = 4;
    ctx.beginPath();

    periodData.forEach((item, index) => {
      const x =
        graphX + (index / Math.max(periodData.length - 1, 1)) * graphWidth;

      const y = graphBottom - (item[dataKey] / maxValue) * 190;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    periodData.forEach((item, index) => {
      const x =
        graphX + (index / Math.max(periodData.length - 1, 1)) * graphWidth;

      const y = graphBottom - (item[dataKey] / maxValue) * 190;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawLine("income", "#049552");
  drawLine("expenses", "#f87171");

  // Labels
  periodData.forEach((item, index) => {
    const x =
      graphX + (index / Math.max(periodData.length - 1, 1)) * graphWidth;

    ctx.textAlign = "center";

    drawText(item.label, x, graphBottom + 25, 11, "400", "#64748b");
  });

  ctx.textAlign = "left";

  // Legend
  drawText("Income", width - padding - 170, chartY, 12, "600", "#049552");

  drawText("Expenses", width - padding - 85, chartY, 12, "600", "#f87171");

  // Categories
  const categoryY = graphBottom + 75;

  drawText("Top spending categories", padding, categoryY, 22, "700");

  const topCategories = spendingBreakdown.slice(0, 5);

  topCategories.forEach(({ category, amount }, index) => {
    const y = categoryY + 35 + index * 28;

    drawText(category, padding, y, 13, "400", "#cbd5e1");

    drawText(formatAmount(amount), width - padding, y, 13, "600", "#ffffff");

    ctx.textAlign = "right";

    ctx.beginPath();
    ctx.moveTo(padding, y + 8);
    ctx.lineTo(width - padding, y + 8);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.stroke();

    ctx.textAlign = "left";
  });

  // Footer
  drawText("PennyPlot", padding, height - 30, 13, "700", "#049552");

  drawText(
    "Analytics snapshot",
    padding + 70,
    height - 30,
    13,
    "400",
    "#64748b",
  );

  // Download
  const link = document.createElement("a");

  link.download = `pennyplot-analytics-${
    new Date().toISOString().split("T")[0]
  }.png`;

  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
