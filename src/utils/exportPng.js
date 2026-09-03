import { getCurrencySymbol } from "./currency";

function loadLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = "/favicon.svg";
  });
}

export async function downloadTransactionsPNG(transactions, currency = "NGN") {
  if (!transactions || transactions.length === 0) {
    throw new Error("There are no transactions to export.");
  }

  const logo = await loadLogo();

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const width = 1200;
  const padding = 70;

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

  const balance = income - expenses;
  const symbol = getCurrencySymbol(currency);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const formatAmount = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

  const roundRect = (x, y, w, h, radius) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.closePath();
  };

  const drawText = (text, x, y, size, weight = "400", color = "#ffffff") => {
    ctx.font = `${weight} ${size}px Arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  };

  const drawStatCard = (x, y, w, h, label, value) => {
    roundRect(x, y, w, h, 18);

    ctx.fillStyle = "#22332b";
    ctx.fill();

    drawText(label, x + 24, y + 34, 15, "400", "#94a3b8");

    drawText(value, x + 24, y + 72, 25, "700", "#ffffff");
  };

  const rowHeight = 58;
  const headerHeight = 260;
  const statsHeight = 150;
  const transactionsHeight = 100 + recentTransactions.length * rowHeight;

  const height =
    padding + headerHeight + statsHeight + transactionsHeight + padding;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#0f1714";
  ctx.fillRect(0, 0, width, height);

  // ─────────────────────────────
  // Logo + Branding
  // ─────────────────────────────

  const logoSize = 58;

  roundRect(padding, 48, logoSize, logoSize, 14);

  ctx.fillStyle = "#22332b";
  ctx.fill();

  ctx.drawImage(logo, padding, 48, logoSize, logoSize);

  drawText("PennyPlot", padding + logoSize + 16, 84, 24, "700", "#ffffff");

  drawText(
    "Your money, clearly plotted.",
    padding + logoSize + 16,
    107,
    13,
    "400",
    "#64748b",
  );

  // ─────────────────────────────
  // Title
  // ─────────────────────────────

  drawText("Transaction Summary", padding, 165, 38, "700", "#ffffff");

  drawText(
    `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`,
    padding,
    200,
    16,
    "400",
    "#94a3b8",
  );

  drawText(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    padding,
    228,
    14,
    "400",
    "#64748b",
  );

  // Currency badge
  roundRect(width - padding - 120, 55, 120, 42, 12);

  ctx.fillStyle = "#049552";
  ctx.fill();

  ctx.textAlign = "center";

  drawText(currency, width - padding - 60, 82, 15, "700", "#ffffff");

  ctx.textAlign = "left";

  // ─────────────────────────────
  // Statistics
  // ─────────────────────────────

  const cardGap = 18;

  const cardWidth = (width - padding * 2 - cardGap * 2) / 3;

  const statsY = padding + headerHeight;

  drawStatCard(padding, statsY, cardWidth, 110, "Income", formatAmount(income));

  drawStatCard(
    padding + cardWidth + cardGap,
    statsY,
    cardWidth,
    110,
    "Expenses",
    formatAmount(expenses),
  );

  drawStatCard(
    padding + (cardWidth + cardGap) * 2,
    statsY,
    cardWidth,
    110,
    "Net balance",
    formatAmount(balance),
  );

  // ─────────────────────────────
  // Recent Transactions
  // ─────────────────────────────

  const sectionY = statsY + statsHeight;

  drawText("Recent transactions", padding, sectionY, 22, "700", "#ffffff");

  const tableY = sectionY + 25;

  const tableHeight = 58 + recentTransactions.length * rowHeight;

  roundRect(padding, tableY, width - padding * 2, tableHeight, 18);

  ctx.fillStyle = "#1b2922";
  ctx.fill();

  // Table header
  drawText("Description", padding + 25, tableY + 36, 14, "600", "#94a3b8");

  drawText("Category", padding + 430, tableY + 36, 14, "600", "#94a3b8");

  drawText("Date", padding + 670, tableY + 36, 14, "600", "#94a3b8");

  drawText("Amount", width - padding - 190, tableY + 36, 14, "600", "#94a3b8");

  recentTransactions.forEach((transaction, index) => {
    const y = tableY + 58 + index * rowHeight;

    if (index > 0) {
      ctx.beginPath();

      ctx.moveTo(padding + 20, y);

      ctx.lineTo(width - padding - 20, y);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";

      ctx.stroke();
    }

    drawText(
      transaction.description,
      padding + 25,
      y + 36,
      15,
      "600",
      "#ffffff",
    );

    drawText(transaction.category, padding + 430, y + 36, 14, "400", "#94a3b8");

    drawText(
      formatDate(transaction.date),
      padding + 670,
      y + 36,
      14,
      "400",
      "#94a3b8",
    );

    const amountText = `${
      transaction.type === "income" ? "+" : "-"
    }${formatAmount(transaction.amount)}`;

    ctx.font = "700 15px Arial";

    const amountWidth = ctx.measureText(amountText).width;

    drawText(
      amountText,
      width - padding - 25 - amountWidth,
      y + 36,
      15,
      "700",
      transaction.type === "income" ? "#049552" : "#f87171",
    );
  });

  // Footer
  drawText("PennyPlot", padding, height - 30, 13, "700", "#049552");

  drawText(
    "Financial overview",
    padding + 70,
    height - 30,
    13,
    "400",
    "#64748b",
  );

  // Download
  const link = document.createElement("a");

  link.download = `pennyplot-transactions-${
    new Date().toISOString().split("T")[0]
  }.png`;

  link.href = canvas.toDataURL("image/png");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
