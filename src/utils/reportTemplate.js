import { translate, formatDate } from "./helpers";

export const generatePrintableReport = (data, options) => {
  const { lang, project, projectName, t } = options;
  const isRtl = lang === "ar";
  const date = new Date().toLocaleDateString(isRtl ? "ar-EG" : "en-US");

  const html = `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${isRtl ? "rtl" : "ltr"}">
    <head>
      <meta charset="UTF-8">
      <title>${t("reports")} - ${projectName}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
        .header-title { font-size: 28px; font-weight: bold; color: #1a73e8; }
        .header-info { text-align: ${isRtl ? "left" : "right"}; font-size: 14px; }
        
        .project-banner { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #dee2e6; }
        .project-banner h2 { margin: 0; font-size: 20px; color: #202124; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
        .stat-card { border: 1px solid #e0e0e0; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1a73e8; display: block; }
        .stat-label { font-size: 12px; color: #5f6368; text-transform: uppercase; }

        .section { margin-bottom: 40px; page-break-inside: avoid; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #1a73e8; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
        th, td { border: 1px solid #e0e0e0; padding: 10px; text-align: ${isRtl ? "right" : "left"}; }
        th { background-color: #f1f3f4; font-weight: 600; color: #3c4043; }
        tr:nth-child(even) { background-color: #fafafa; }

        .badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; }
        .badge-success { background: #e6f4ea; color: #1e8e3e; }
        .badge-danger { background: #fce8e6; color: #d93025; }
        .badge-warning { background: #fef7e0; color: #f9ab00; }
        .badge-info { background: #e8f0fe; color: #1a73e8; }

        .footer { margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #70757a; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">${t("appName")}</div>
          <div style="font-size: 14px; color: #5f6368;">Safety & Health Management System</div>
        </div>
        <div class="header-info">
          <div><strong>${t("date")}:</strong> ${date}</div>
          <div><strong>${t("reports")} ID:</strong> ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
        </div>
      </div>

      <div class="project-banner">
        <h2>${t("project")}: ${projectName}</h2>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-value">${data.permits.length}</span>
          <span class="stat-label">${t("totalPermits")}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${data.notes.length}</span>
          <span class="stat-label">${t("totalNotes")}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${data.incidents.length}</span>
          <span class="stat-label">${t("totalIncidents")}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${data.tbt.length}</span>
          <span class="stat-label">${t("totalTBT")}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${data.licenses.length}</span>
          <span class="stat-label">${t("totalLicenses")}</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${data.licenses.filter(l => l.status === "valid").length}</span>
          <span class="stat-label">${t("valid")} ${t("licenses")}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">${t("permitsStatus")}</div>
        <table>
          <thead>
            <tr>
              <th>${t("type")}</th>
              <th>${t("project")}</th>
              <th>${t("location")}</th>
              <th>${t("date")}</th>
              <th>${t("status")}</th>
            </tr>
          </thead>
          <tbody>
            ${data.permits.slice(0, 10).map(p => `
              <tr>
                <td>${t(p.type)}</td>
                <td>${p.project}</td>
                <td>${p.location || "-"}</td>
                <td>${formatDate(p.date)}</td>
                <td><span class="badge ${p.status === "active" ? "badge-success" : "badge-danger"}">${t(p.status)}</span></td>
              </tr>
            `).join("")}
            ${data.permits.length > 10 ? `<tr><td colspan="5" style="text-align: center; color: #888;">+ ${data.permits.length - 10} more items...</td></tr>` : ""}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${t("incidentsManagement")}</div>
        <table>
          <thead>
            <tr>
              <th>${t("title")}</th>
              <th>${t("type")}</th>
              <th>${t("project")}</th>
              <th>${t("date")}</th>
              <th>${t("severity")}</th>
            </tr>
          </thead>
          <tbody>
            ${data.incidents.length ? data.incidents.slice(0, 10).map(i => `
              <tr>
                <td>${i.title || "-"}</td>
                <td>${t(i.type)}</td>
                <td>${i.project}</td>
                <td>${formatDate(i.date)}</td>
                <td><span class="badge ${i.severity === "critical" ? "badge-danger" : i.severity === "high" ? "badge-warning" : "badge-info"}">${t(i.severity)}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="5" style="text-align: center;">${t("noData")}</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="section">
        <div class="section-title">${t("fieldNotes")}</div>
        <table>
          <thead>
            <tr>
              <th>${t("title")}</th>
              <th>${t("type")}</th>
              <th>${t("project")}</th>
              <th>${t("supervisor")}</th>
              <th>${t("status")}</th>
            </tr>
          </thead>
          <tbody>
            ${data.notes.length ? data.notes.slice(0, 10).map(n => `
              <tr>
                <td>${n.title || "-"}</td>
                <td>${t(n.type)}</td>
                <td>${n.project}</td>
                <td>${n.supervisor || "-"}</td>
                <td><span class="badge ${n.status === "closed" ? "badge-success" : "badge-warning"}">${t(n.status)}</span></td>
              </tr>
            `).join("") : `<tr><td colspan="5" style="text-align: center;">${t("noData")}</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>Generated by EHS Platform - Digital Safety Solutions</div>
        <div>Page 1 of 1</div>
      </div>

      <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
        <button onclick="window.print()" style="padding: 12px 24px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
          🖨️ ${t("print") || "Print Report"}
        </button>
      </div>
    </body>
    </html>
  `;
  return html;
};
