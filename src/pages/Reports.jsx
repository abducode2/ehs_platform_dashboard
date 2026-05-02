import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { T } from "../utils/translations";
import { showToast, downloadCSV } from "../utils/helpers";
import { StatusBadge } from "../components/Common/Badges";
import Loading from "../components/UI/Loading";
import Modal from "../components/UI/Modal";
import { generatePrintableReport } from "../utils/reportTemplate";

export default function Reports() {
  const { isManager, getUserProjects, projectsData, getProjectName } =
    useAuth();
  const { lang } = useThemeLang();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [selectedProject, setSelectedProject] = useState("all");
  const [viewProject, setViewProject] = useState("all");
  const [timePeriod, setTimePeriod] = useState("all");
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };
  const [stats, setStats] = useState({
    permits: [],
    notes: [],
    incidents: [],
    tbt: [],
    licenses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const projects = getUserProjects();
      const isMgr = isManager();
      const { data: permits } = await supabase
        .from("permits")
        .select("*")
        .in("project", projects);
      const { data: notes } = await supabase
        .from("notes")
        .select("*")
        .in("project", projects);
      const { data: incidents } = isMgr
        ? await supabase.from("incidents").select("*")
        : { data: [] };
      const { data: tbt } = await supabase
        .from("tbt_sessions")
        .select("*")
        .in("project", projects);
      const { data: licenses } = await supabase
        .from("licenses")
        .select("*")
        .in("project", projects);
      setStats({
        permits: permits || [],
        notes: notes || [],
        incidents: incidents || [],
        tbt: tbt || [],
        licenses: licenses || [],
      });
      setLoading(false);
    };
    fetchAll();
  }, [isManager, getUserProjects]);

  const handleExportClick = (type) => {
    setExportType(type);
    setIsExportModalOpen(true);
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    const projName =
      selectedProject === "all"
        ? t("allProj")
        : getProjectName(selectedProject, lang);

    // استخدام الدالة الموحدة للفلترة
    const filteredData = getFilteredData(selectedProject, timePeriod);

    if (exportType === "pdf") {
      // 2. تصدير PDF (عن طريق فتح نافذة طباعة)
      const reportHtml = generatePrintableReport(filteredData, {
        lang,
        project: selectedProject,
        projectName: projName,
        t,
      });

      const win = window.open("", "_blank");
      win.document.write(reportHtml);
      win.document.close();
    } else {
      // 3. تصدير Excel (CSV مبدئياً)
      const csvData = [
        { Metric: t("totalPermits"), Value: filteredData.permits.length },
        { Metric: t("totalNotes"), Value: filteredData.notes.length },
        { Metric: t("totalIncidents"), Value: filteredData.incidents.length },
        { Metric: t("totalTBT"), Value: filteredData.tbt.length },
        { Metric: t("totalLicenses"), Value: filteredData.licenses.length },
      ];
      downloadCSV(
        csvData,
        `Report_${selectedProject}_${formatDate(new Date())}.csv`,
      );
    }

    const msg = `✅ ${t("reportExported")} (${exportType.toUpperCase()}) - ${projName}`;
    showToast(msg, "success");
    setIsExportModalOpen(false);
  };

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );

  const safePercent = (count, total) =>
    total ? Math.round((count / total) * 100) : 0;

  const baseFilteredStats = {
    permits:
      viewProject === "all"
        ? stats.permits
        : stats.permits.filter((p) => p.project === viewProject),
    notes:
      viewProject === "all"
        ? stats.notes
        : stats.notes.filter((n) => n.project === viewProject),
    incidents:
      viewProject === "all"
        ? stats.incidents
        : stats.incidents.filter((i) => i.project === viewProject),
    tbt:
      viewProject === "all"
        ? stats.tbt
        : stats.tbt.filter((t) => t.project === viewProject),
    licenses:
      viewProject === "all"
        ? stats.licenses
        : stats.licenses.filter((l) => l.project === viewProject),
  };

  // 2. تطبيق فلترة الوقت والمشروع بشكل موحد
  const getFilteredData = (targetProj, targetTime) => {
    const applyProj = (list) =>
      targetProj === "all" ? list : list.filter((item) => item.project === targetProj);

    const applyTime = (list) => {
      if (targetTime === "all") return list;
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      return list.filter((item) => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        
        if (targetTime === "daily") return itemDate >= startOfToday;
        if (targetTime === "weekly") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        }
        if (targetTime === "monthly") {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= monthAgo;
        }
        if (targetTime === "yearly") {
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return itemDate >= yearAgo;
        }
        return true;
      });
    };

    return {
      permits: applyTime(applyProj(stats.permits)),
      notes: applyTime(applyProj(stats.notes)),
      incidents: applyTime(applyProj(stats.incidents)),
      tbt: applyTime(applyProj(stats.tbt)),
      licenses: applyTime(applyProj(stats.licenses)),
    };
  };

  const filteredViewStats = getFilteredData(viewProject, timePeriod);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">📈</span> {t("reports")}
          </div>
          <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
            <select
              className="form-control"
              value={viewProject}
              onChange={(e) => {
                setViewProject(e.target.value);
                setSelectedProject(e.target.value);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--surface)",
                color: "var(--text2)",
                minWidth: "140px",
              }}
            >
              <option value="all">{t("allProjects")}</option>
              {projectsData.map((p) => (
                <option key={p.key} value={p.key}>
                  {lang === "ar" ? p.name_ar : p.name_en}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--surface)",
                color: "var(--text2)",
                minWidth: "140px",
              }}
            >
              <option value="all">{t("allTime")}</option>
              <option value="daily">{t("daily")}</option>
              <option value="weekly">{t("weekly")}</option>
              <option value="monthly">{t("monthly")}</option>
              <option value="yearly">{t("yearly")}</option>
            </select>
          </div>
        </div>
        {isManager() && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn btn-danger"
              onClick={() => handleExportClick("pdf")}
            >
              📄 {t("exportPDF")}
            </button>
            <button
              className="btn btn-success"
              onClick={() => handleExportClick("excel")}
            >
              📊 {t("exportExcel")}
            </button>
          </div>
        )}
      </div>

      <div className="report-grid">
        <div className="report-stat">
          <div className="report-stat-num">
            {filteredViewStats.permits.length}
          </div>
          <div className="report-stat-label">{t("totalPermits")}</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-num">
            {filteredViewStats.notes.length}
          </div>
          <div className="report-stat-label">{t("totalNotes")}</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-num">
            {filteredViewStats.incidents.length}
          </div>
          <div className="report-stat-label">{t("totalIncidents")}</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-num">{filteredViewStats.tbt.length}</div>
          <div className="report-stat-label">{t("totalTBT")}</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-num">
            {filteredViewStats.licenses.length}
          </div>
          <div className="report-stat-label">{t("totalLicenses")}</div>
        </div>
        <div className="report-stat">
          <div className="report-stat-num">
            {
              filteredViewStats.licenses.filter((l) => l.status === "valid")
                .length
            }
          </div>
          <div className="report-stat-label">
            {t("valid")} {t("licenses")}
          </div>
        </div>
      </div>

      <div className="report-details-grid">
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>
            📋 {t("permitsStatus")}
          </div>
          {["active", "closed"].map((s) => {
            const cnt = filteredViewStats.permits.filter(
              (p) => p.status === s,
            ).length;
            const pct = safePercent(cnt, filteredViewStats.permits.length);
            return (
              <div key={s} style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  <StatusBadge status={s} />
                  <span style={{ fontWeight: 700 }}>
                    {cnt} ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--bg3)",
                    borderRadius: "4px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background: "var(--accent)",
                      height: "100%",
                      borderRadius: "4px",
                      width: `${pct}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>
            📝 {t("notesStats")}
          </div>
          {[
            { type: "unsafeAct", label: t("unsafeActCount") },
            { type: "unsafeCondition", label: t("unsafeCondCount") },
          ].map((item) => {
            const cnt = filteredViewStats.notes.filter(
              (n) => n.type === item.type,
            ).length;
            const pct = safePercent(cnt, filteredViewStats.notes.length);
            return (
              <div key={item.type} style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 700 }}>
                    {cnt} ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--bg3)",
                    borderRadius: "4px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background:
                        item.type === "unsafeAct"
                          ? "var(--danger)"
                          : "var(--warning)",
                      height: "100%",
                      borderRadius: "4px",
                      width: `${pct}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>
            ⚠️ {t("incidentsByType")}
          </div>
          {["injury", "electrical", "slip", "fall", "fire", "suffocation"].map(
            (type) => {
              const cnt = filteredViewStats.incidents.filter(
                (i) => i.type === type,
              ).length;
              if (!cnt) return null;
              const labels = {
                injury: t("injury"),
                electrical: t("electrical"),
                slip: t("slip"),
                fall: t("fall"),
                fire: t("fire"),
                suffocation: t("suffocation"),
              };
              return (
                <div
                  key={type}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>{labels[type]}</span>
                  <span className="badge-status badge-high">{cnt}</span>
                </div>
              );
            },
          )}
          {!filteredViewStats.incidents.length && (
            <div style={{ color: "var(--text3)", padding: "16px 0" }}>
              {t("noData")}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: "14px" }}>
            🏅 {t("licenses")}
          </div>
          {["valid", "expiring", "expired"].map((s) => {
            const cnt = filteredViewStats.licenses.filter(
              (l) => l.status === s,
            ).length;
            const pct = safePercent(cnt, filteredViewStats.licenses.length);
            const colors = {
              valid: "var(--success)",
              expiring: "var(--warning)",
              expired: "var(--danger)",
            };
            return (
              <div key={s} style={{ marginBottom: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "4px",
                  }}
                >
                  <StatusBadge status={s} />
                  <span style={{ fontWeight: 700 }}>
                    {cnt} ({pct}%)
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--bg3)",
                    borderRadius: "4px",
                    height: "8px",
                  }}
                >
                  <div
                    style={{
                      background: colors[s],
                      height: "100%",
                      borderRadius: "4px",
                      width: `${pct}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title={t("exportOptions")}
        confirmText={t("export")}
      >
        <form id="modal-form" onSubmit={handleExportSubmit}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "8px" }}>
              {t("selectProjectForExport") || "Select Project for Export"}
            </label>
            <select
              className="form-control"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg2)",
                color: "var(--text)",
              }}
            >
              <option value="all">{t("allProj")}</option>
              {projectsData.map((p) => (
                <option key={p.key} value={p.key}>
                  {lang === "ar" ? p.name_ar : p.name_en}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "var(--bg3)",
              borderRadius: "8px",
              fontSize: "14px",
              color: "var(--text2)",
            }}
          >
            ℹ️ {t("exportTypeNote") || "Exporting as"}{" "}
            <strong>{exportType.toUpperCase()}</strong>
          </div>
        </form>
      </Modal>
    </div>
  );
}
