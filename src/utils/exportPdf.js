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

export async function downloadTransactionsPDF(
  transactions,
  currency = "NGN",
) {
  if (!transactions || transactions.length === 0) {
    throw new Error("There are no transactions to export.");
  }

  const logo = await loadLogo();

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const symbol = getCurrencySymbol(currency);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0,
    );

  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0,
    );

  const balance = income - expenses;

  const formatAmount = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-NG")}`;

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-GB");
  };

  function addPageNumber() {
    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        `PennyPlot • Financial overview`,
        margin,
        pageHeight - 10,
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 10,
        {
          align: "right",
        },
      );
    }
  }

  function drawHeader() {
    // Logo background
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

    // Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 20);

    doc.text(
      "PennyPlot",
      margin + 21,
      21,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text(
      "Your money, clearly plotted.",
      margin + 21,
      26,
    );

    // Currency badge
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

  function drawStatCard(
    x,
    y,
    width,
    label,
    value,
  ) {
    doc.setFillColor(244, 247, 245);

    doc.roundedRect(
      x,
      y,
      width,
      25,
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
      y + 8,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 20);

    doc.text(
      value,
      x + 5,
      y + 18,
    );
  }

  // =========================
  // HEADER
  // =========================

  drawHeader();

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Transaction Report",
    margin,
    47,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);

  doc.text(
    "A detailed overview of your recorded financial activity.",
    margin,
    54,
  );

  doc.text(
    `Generated ${new Date().toLocaleDateString("en-GB")}`,
    margin,
    61,
  );

  // Green divider
  doc.setFillColor(4, 149, 82);

  doc.roundedRect(
    margin,
    67,
    30,
    1.5,
    1,
    1,
    "F",
  );

  // =========================
  // SUMMARY
  // =========================

  const cardGap = 5;

  const cardWidth =
    (pageWidth - margin * 2 - cardGap * 2) / 3;

  drawStatCard(
    margin,
    77,
    cardWidth,
    "Income",
    formatAmount(income),
  );

  drawStatCard(
    margin + cardWidth + cardGap,
    77,
    cardWidth,
    "Expenses",
    formatAmount(expenses),
  );

  drawStatCard(
    margin + (cardWidth + cardGap) * 2,
    77,
    cardWidth,
    "Net balance",
    formatAmount(balance),
  );

  // =========================
  // TRANSACTION SECTION
  // =========================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 20);

  doc.text(
    "Transactions",
    margin,
    119,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  doc.text(
    `${transactions.length} ${
      transactions.length === 1
        ? "transaction"
        : "transactions"
    } recorded`,
    margin,
    125,
  );

  // =========================
  // TABLE
  // =========================

  let tableY = 133;

  const rowHeight = 12;

  const columns = {
    date: margin,
    description: margin + 31,
    category: margin + 92,
    type: margin + 127,
    amount: pageWidth - margin,
  };

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
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);

    doc.text(
      "DATE",
      columns.date + 4,
      tableY + 7,
    );

    doc.text(
      "DESCRIPTION",
      columns.description,
      tableY + 7,
    );

    doc.text(
      "CATEGORY",
      columns.category,
      tableY + 7,
    );

    doc.text(
      "TYPE",
      columns.type,
      tableY + 7,
    );

    doc.text(
      "AMOUNT",
      columns.amount,
      tableY + 7,
      {
        align: "right",
      },
    );

    tableY += 11;
  }

  drawTableHeader();

  transactions.forEach((transaction, index) => {
    // New page if needed
    if (tableY + rowHeight > pageHeight - 18) {
      doc.addPage();

      drawHeader();

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 20);

      doc.text(
        "Transactions",
        margin,
        47,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);

      doc.text(
        "Continued",
        margin,
        53,
      );

      tableY = 61;

      drawTableHeader();
    }

    // Alternating row background
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

    // Bottom divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);

    doc.line(
      margin,
      tableY + rowHeight,
      pageWidth - margin,
      tableY + rowHeight,
    );

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    doc.text(
      formatDate(transaction.date),
      columns.date + 4,
      tableY + 7.5,
    );

    // Description
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 20);

    const description =
      transaction.description.length > 27
        ? `${transaction.description.slice(0, 27)}...`
        : transaction.description;

    doc.text(
      description,
      columns.description,
      tableY + 7.5,
    );

    // Category
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    doc.text(
      transaction.category,
      columns.category,
      tableY + 7.5,
    );

    // Type
    const isIncome =
      transaction.type === "income";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);

    if (isIncome) {
      doc.setTextColor(4, 149, 82);
    } else {
      doc.setTextColor(220, 75, 75);
    }

    doc.text(
      isIncome ? "Income" : "Expense",
      columns.type,
      tableY + 7.5,
    );

    // Amount
    const amountText = `${
      isIncome ? "+" : "-"
    }${formatAmount(transaction.amount)}`;

    doc.text(
      amountText,
      columns.amount,
      tableY + 7.5,
      {
        align: "right",
      },
    );

    tableY += rowHeight;
  });

  // =========================
  // REPORT FOOTER NOTE
  // =========================

  if (tableY + 25 > pageHeight - 18) {
    doc.addPage();
    drawHeader();
    tableY = 55;
  }

  doc.setFillColor(240, 253, 244);

  doc.roundedRect(
    margin,
    tableY + 12,
    pageWidth - margin * 2,
    22,
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
    "This report was generated from your locally stored PennyPlot transactions.",
    margin + 6,
    tableY + 27,
  );

  // Page numbers
  addPageNumber();

  // Download
  doc.save(
    `pennyplot-transactions-${
      new Date().toISOString().split("T")[0]
    }.pdf`,
  );
}