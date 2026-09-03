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

export async function downloadAnalyticsPDF(
  periodData,
  spendingBreakdown,
  currency = "NGN",
  period = "monthly",
) {
  if (!periodData || periodData.length === 0) {
    throw new Error("There is no analytics data to export.");
  }

  const logo = await loadLogo();

  const doc = new jsPDF();

  const symbol = getCurrencySymbol(currency);

  const pageWidth =
    doc.internal.pageSize.getWidth();

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const margin = 18;

  const current =
    periodData[periodData.length - 1];

  const totalIncome = periodData.reduce(
    (total, item) => total + item.income,
    0,
  );

  const totalExpenses = periodData.reduce(
    (total, item) => total + item.expenses,
    0,
  );

  const formatAmount = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;

  const periodNames = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  function header() {
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

  function footer() {
    const pages =
      doc.internal.getNumberOfPages();

    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        "PennyPlot • Analytics report",
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

  // Header
  header();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(15, 23, 20);

  doc.text(
    `${periodNames[period] || "Analytics"} Report`,
    margin,
    49,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(
    "A detailed overview of your financial patterns.",
    margin,
    56,
  );

  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    margin,
    63,
  );

  // Summary cards
  const gap = 5;

  const cardWidth =
    (pageWidth - margin * 2 - gap * 2) / 3;

  const summary = [
    ["Income", totalIncome],
    ["Expenses", totalExpenses],
    ["Current net", current.net],
  ];

  summary.forEach(
    ([label, amount], index) => {
      const x =
        margin +
        index * (cardWidth + gap);

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

      doc.text(
        label,
        x + 5,
        84,
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      doc.setTextColor(
        label === "Expenses"
          ? 220
          : 4,
        label === "Expenses"
          ? 75
          : 149,
        label === "Expenses"
          ? 75
          : 82,
      );

      doc.text(
        formatAmount(amount),
        x + 5,
        95,
      );
    },
  );

  // Period data
  let y = 122;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Period performance",
    margin,
    y,
  );

  y += 10;

  // Table header
  doc.setFillColor(34, 51, 43);

  doc.roundedRect(
    margin,
    y,
    pageWidth - margin * 2,
    11,
    3,
    3,
    "F",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);

  doc.text("PERIOD", margin + 5, y + 7);

  doc.text(
    "INCOME",
    margin + 60,
    y + 7,
  );

  doc.text(
    "EXPENSES",
    margin + 100,
    y + 7,
  );

  doc.text(
    "NET",
    pageWidth - margin - 5,
    y + 7,
    {
      align: "right",
    },
  );

  y += 11;

  periodData.forEach(
    (item, index) => {
      if (y + 12 > pageHeight - 20) {
        doc.addPage();
        header();

        y = 48;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 249);

        doc.rect(
          margin,
          y,
          pageWidth - margin * 2,
          12,
          "F",
        );
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      doc.text(
        item.label,
        margin + 5,
        y + 8,
      );

      doc.setTextColor(4, 149, 82);

      doc.text(
        formatAmount(item.income),
        margin + 60,
        y + 8,
      );

      doc.setTextColor(220, 75, 75);

      doc.text(
        formatAmount(item.expenses),
        margin + 100,
        y + 8,
      );

      doc.setTextColor(
        item.net >= 0 ? 4 : 220,
        item.net >= 0 ? 149 : 75,
        item.net >= 0 ? 82 : 75,
      );

      doc.text(
        formatAmount(item.net),
        pageWidth - margin - 5,
        y + 8,
        {
          align: "right",
        },
      );

      y += 12;
    },
  );

  // Spending breakdown
  y += 15;

  if (y + 40 > pageHeight - 20) {
    doc.addPage();
    header();
    y = 48;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Spending breakdown",
    margin,
    y,
  );

  y += 10;

  spendingBreakdown
    .slice(0, 8)
    .forEach(({ category, amount }) => {
      if (y + 10 > pageHeight - 20) {
        doc.addPage();
        header();
        y = 48;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      doc.text(
        category,
        margin,
        y,
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 20);

      doc.text(
        formatAmount(amount),
        pageWidth - margin,
        y,
        {
          align: "right",
        },
      );

      y += 10;
    });

  footer();

  doc.save(
    `pennyplot-analytics-${
      new Date().toISOString().split("T")[0]
    }.pdf`,
  );
}