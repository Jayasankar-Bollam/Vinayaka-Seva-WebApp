// server/templates/reportTemplate.js
function buildReportHtml({ org, reportTitle, columns, rows, totalLabel, totalValue }) {
  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: 'Helvetica', Arial, sans-serif; color: #222; margin: 40px; }
      .letterhead { border-bottom: 3px solid #b8860b; padding-bottom: 16px; margin-bottom: 24px; }
      .org-name { font-size: 22px; font-weight: bold; color: #7a4f01; }
      .report-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px; text-align: center; text-decoration: underline; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ccc; padding: 8px 10px; font-size: 12px; text-align: left; }
      th { background: #fdf3e0; color: #7a4f01; }
      tr:nth-child(even) { background: #fafafa; }
      .totals-row td { font-weight: bold; background: #fdf3e0; }
      .footer { margin-top: 30px; font-size: 10px; color: #888; text-align: center; }
    </style>
  </head>
  <body>
    <div class="letterhead">
      <div class="org-name">${org.name}</div>
    </div>

    <div class="report-title">${reportTitle}</div>

    <table>
      <thead>
        <tr>${columns.map((c) => `<th>${c}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        <tr class="totals-row">
          <td colspan="${columns.length - 1}">${totalLabel}</td>
          <td>${totalValue}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">Generated on ${new Date().toLocaleDateString('en-IN')} — Vinaya Seva</div>
  </body>
  </html>
  `;
}

module.exports = buildReportHtml;