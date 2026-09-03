import { getCurrencySymbol } from "./currency";

function loadLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = "/favicon.svg";
  });
}

export async function downloadBudgetsPNG(
  budgetData,
  currency = "NGN",
) {
  if (!budgetData || budgetData.length === 0) {
    throw new Error("There are no budgets to export.");
  }

  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 1200;
  const padding = 70;
  const symbol = getCurrencySymbol(currency);

  const totalBudget = budgetData.reduce(
    (total, budget) => total + budget.amount,
    0,
  );

  const totalSpent = budgetData.reduce(
    (total, budget) => total + budget.spent,
    0,
  );

  const totalRemaining = totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0
      ? (totalSpent / totalBudget) * 100
      : 0;

  const formatAmount = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;

  const height =
    padding +
    140 +
    150 +
    90 +
    budgetData.length * 75 +
    padding;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#0f1714";
  ctx.fillRect(0, 0, width, height);

  function drawText(
    text,
    x,
    y,
    size,
    weight = "400",
    color = "#ffffff",
  ) {
    ctx.font = `${weight} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  function roundedRect(
    x,
    y,
    w,
    h,
    radius,
    color,
  ) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Header
  roundedRect(
    padding,
    45,
    58,
    58,
    14,
    "#22332b",
  );

  ctx.drawImage(
    logo,
    padding,
    45,
    58,
    58,
  );

  drawText(
    "PennyPlot",
    padding + 75,
    80,
    25,
    "700",
  );

  drawText(
    "Your money, clearly plotted.",
    padding + 75,
    103,
    13,
    "400",
    "#64748b",
  );

  drawText(
    "Budget Overview",
    padding,
    160,
    38,
    "700",
  );

  drawText(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    padding,
    190,
    14,
    "400",
    "#64748b",
  );

  roundedRect(
    width - padding - 120,
    55,
    120,
    42,
    12,
    "#049552",
  );

  ctx.textAlign = "center";

  drawText(
    currency,
    width - padding - 60,
    82,
    15,
    "700",
  );

  ctx.textAlign = "left";

  // Summary cards
  const cardGap = 18;

  const cardWidth =
    (width - padding * 2 - cardGap * 2) / 3;

  const cards = [
    ["Total budget", totalBudget],
    ["Total spent", totalSpent],
    ["Remaining", totalRemaining],
  ];

  cards.forEach(([label, amount], index) => {
    const x =
      padding +
      index * (cardWidth + cardGap);

    roundedRect(
      x,
      220,
      cardWidth,
      110,
      18,
      "#22332b",
    );

    drawText(
      label,
      x + 24,
      255,
      15,
      "400",
      "#94a3b8",
    );

    drawText(
      formatAmount(amount),
      x + 24,
      297,
      25,
      "700",
      label === "Total spent"
        ? "#f87171"
        : totalRemaining >= 0
          ? "#049552"
          : "#f87171",
    );
  });

  // Overall usage
  const usageY = 375;

  drawText(
    "Overall budget usage",
    padding,
    usageY,
    22,
    "700",
  );

  drawText(
    `${Math.min(Math.round(overallPercentage), 999)}%`,
    width - padding,
    usageY,
    20,
    "700",
    overallPercentage >= 100
      ? "#f87171"
      : overallPercentage >= 75
        ? "#facc15"
        : "#049552",
  );

  ctx.textAlign = "right";

  roundedRect(
    padding,
    usageY + 25,
    width - padding * 2,
    18,
    9,
    "#22332b",
  );

  const usageWidth =
    Math.min(overallPercentage, 100) / 100 *
    (width - padding * 2);

  if (usageWidth > 0) {
    roundedRect(
      padding,
      usageY + 25,
      usageWidth,
      18,
      9,
      overallPercentage >= 100
        ? "#f87171"
        : overallPercentage >= 75
          ? "#facc15"
          : "#049552",
    );
  }

  ctx.textAlign = "left";

  // Budget list
  const listY = 455;

  drawText(
    "Budget performance",
    padding,
    listY,
    22,
    "700",
  );

  budgetData.forEach((budget, index) => {
    const y = listY + 35 + index * 75;

    roundedRect(
      padding,
      y,
      width - padding * 2,
      60,
      14,
      "#1b2922",
    );

    drawText(
      budget.category,
      padding + 20,
      y + 25,
      16,
      "700",
    );

    drawText(
      `${budget.period} budget`,
      padding + 20,
      y + 45,
      12,
      "400",
      "#64748b",
    );

    drawText(
      `${formatAmount(budget.spent)} / ${formatAmount(budget.amount)}`,
      width - padding - 20,
      y + 25,
      15,
      "700",
    );

    ctx.textAlign = "right";

    drawText(
      `${Math.round(budget.percentage)}% used`,
      width - padding - 20,
      y + 45,
      12,
      "400",
      budget.status === "exceeded"
        ? "#f87171"
        : budget.status === "warning"
          ? "#facc15"
          : "#049552",
    );

    ctx.textAlign = "left";

    // Progress bar
    roundedRect(
      padding + 20,
      y + 50,
      260,
      5,
      3,
      "rgba(255,255,255,0.08)",
    );

    const progressWidth =
      Math.min(budget.percentage, 100) / 100 * 260;

    if (progressWidth > 0) {
      roundedRect(
        padding + 20,
        y + 50,
        progressWidth,
        5,
        3,
        budget.status === "exceeded"
          ? "#f87171"
          : budget.status === "warning"
            ? "#facc15"
            : "#049552",
      );
    }
  });

  // Footer
  drawText(
    "PennyPlot",
    padding,
    height - 30,
    13,
    "700",
    "#049552",
  );

  drawText(
    "Budget overview",
    padding + 70,
    height - 30,
    13,
    "400",
    "#64748b",
  );

  const link = document.createElement("a");

  link.download = `pennyplot-budgets-${
    new Date().toISOString().split("T")[0]
  }.png`;

  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}