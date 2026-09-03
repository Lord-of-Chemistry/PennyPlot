import jsPDF from "jspdf";
import { getCurrencySymbol } from "./currency";

function loadLogo() {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = reject;
    image.src = "/favicon.svg";
  });
}

export async function downloadBudgetsPDF(
  budgetData,
  currency = "NGN",
) {
  if (!budgetData || budgetData.length === 0) {
    throw new Error("There are no budgets to export.");
  }

  const logo = await loadLogo();

  const doc = new jsPDF();

  const symbol = getCurrencySymbol(currency);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;

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

  function drawHeader() {
    doc.setFillColor(34, 51, 43);

    doc.roundedRect(
      margin,
      14,
      16,
      16,
      3,
      3,
      "F",
    );

    doc.addImage(
      logo,
      "PNG",
      margin,
      14,
      16,
      16,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 20);

    doc.text(
      "PennyPlot",
      margin + 21,
      22,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "Your money, clearly plotted.",
      margin + 21,
      27,
    );

    doc.setFillColor(4, 149, 82);

    doc.roundedRect(
      pageWidth - margin - 25,
      16,
      25,
      10,
      3,
      3,
      "F",
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text(
      currency,
      pageWidth - margin - 12.5,
      22.5,
      {
        align: "center",
      },
    );
  }

  function addFooter() {
    const pages = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        "PennyPlot • Budget report",
        margin,
        pageHeight - 10,
      );

      doc.text(
        `Page ${page} of ${pages}`,
        pageWidth - margin,
        pageHeight - 10,
        {
          align: "right",
        },
      );
    }
  }

  drawHeader();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Budget Report",
    margin,
    49,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(
    "A detailed overview of your spending limits and usage.",
    margin,
    56,
  );

  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    margin,
    63,
  );

  const gap = 5;

  const cardWidth =
    (pageWidth - margin * 2 - gap * 2) / 3;

  const summary = [
    ["Total budget", totalBudget],
    ["Total spent", totalSpent],
    ["Remaining", totalRemaining],
  ];

  summary.forEach(([label, amount], index) => {
    const x =
      margin + index * (cardWidth + gap);

    doc.setFillColor(244, 247, 245);

    doc.roundedRect(
      x,
      75,
      cardWidth,
      27,
      4,
      4,
      "F",
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(label, x + 5, 84);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    const positive =
      label !== "Total spent" &&
      totalRemaining >= 0;

    doc.setTextColor(
      label === "Total spent"
        ? 220
        : positive
          ? 4
          : 220,
      label === "Total spent"
        ? 75
        : positive
          ? 149
          : 75,
      label === "Total spent"
        ? 75
        : positive
          ? 82
          : 75,
    );

    doc.text(
      formatAmount(amount),
      x + 5,
      95,
    );
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Budget performance",
    margin,
    122,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `Overall usage: ${Math.min(
      Math.round(overallPercentage),
      999,
    )}%`,
    margin,
    129,
  );

  let tableY = 138;
  const rowHeight = 13;

  function drawTableHeader() {
    doc.setFillColor(34, 51, 43);

    doc.roundedRect(
      margin,
      tableY,
      pageWidth - margin * 2,
      11,
      3,
      3,
      "F",
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    doc.text("CATEGORY", margin + 4, tableY + 7);
    doc.text("PERIOD", margin + 45, tableY + 7);
    doc.text("BUDGET", margin + 78, tableY + 7);
    doc.text("SPENT", margin + 112, tableY + 7);
    doc.text("REMAINING", margin + 142, tableY + 7);

    doc.text(
      "USAGE",
      pageWidth - margin - 35,
      tableY + 7,
    );

    tableY += 11;
  }

  drawTableHeader();

  budgetData.forEach((budget, index) => {
    if (tableY + rowHeight > pageHeight - 20) {
      doc.addPage();
      drawHeader();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 20);

      doc.text(
        "Budget performance",
        margin,
        48,
      );

      tableY = 56;

      drawTableHeader();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 249);

      doc.rect(
        margin,
        tableY,
        pageWidth - margin * 2,
        rowHeight,
        "F",
      );
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);

    doc.line(
      margin,
      tableY + rowHeight,
      pageWidth - margin,
      tableY + rowHeight,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 20);

    doc.text(
      budget.category,
      margin + 4,
      tableY + 8,
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);

    doc.text(
      budget.period,
      margin + 45,
      tableY + 8,
    );

    doc.text(
      formatAmount(budget.amount),
      margin + 78,
      tableY + 8,
    );

    doc.text(
      formatAmount(budget.spent),
      margin + 112,
      tableY + 8,
    );

    doc.text(
      formatAmount(budget.remaining),
      margin + 142,
      tableY + 8,
    );

    const statusColor =
      budget.status === "exceeded"
        ? [220, 75, 75]
        : budget.status === "warning"
          ? [202, 138, 4]
          : [4, 149, 82];

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...statusColor);

    doc.text(
      `${Math.round(budget.percentage)}%`,
      pageWidth - margin - 35,
      tableY + 8,
    );

    tableY += rowHeight;
  });

  if (tableY + 35 > pageHeight - 20) {
    doc.addPage();
    drawHeader();
    tableY = 55;
  }

  doc.setFillColor(240, 253, 244);

  doc.roundedRect(
    margin,
    tableY + 12,
    pageWidth - margin * 2,
    24,
    4,
    4,
    "F",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(4, 149, 82);

  doc.text(
    "PennyPlot",
    margin + 6,
    tableY + 21,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  doc.text(
    "This report was generated from your locally stored PennyPlot budgets.",
    margin + 6,
    tableY + 28,
  );

  addFooter();

  doc.save(
    `pennyplot-budgets-${
      new Date().toISOString().split("T")[0]
    }.pdf`,
  );
}