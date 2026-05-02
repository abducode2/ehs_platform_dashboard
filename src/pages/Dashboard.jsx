import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { formatDate, translate } from "../utils/helpers";
import KPICard from "../components/Common/KPICard";
import { TypeBadge } from "../components/Common/Badges";
import SimpleBarChart from "../components/Charts/SimpleBarChart";
import Loading from "../components/UI/Loading";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
  const { isManager, getUserProjects, user, getProjectName } = useAuth();
  const { lang } = useThemeLang();

  const t = (key) => translate(lang, key);

  const [stats, setStats] = useState({
    activePermits: 0,
    notesCloseRate: 0,
    daysNoIncident: 45,
    attendRate: 0,
    unsafeActs: 0,
    unsafeConds: 0,
    recentPermits: [],
    recentIncidents: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = getUserProjects();
        const isMgr = isManager();

        // التصاريح النشطة
        let permitsQuery = supabase
          .from("permits")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");
        if (!isMgr) permitsQuery = permitsQuery.in("project", projects);
        const { count: activePermits } = await permitsQuery;

        // الملاحظات
        let notesQuery = supabase.from("notes").select("*");
        if (!isMgr) notesQuery = notesQuery.in("project", projects);
        const { data: allNotes } = await notesQuery;
        const closedNotes =
          allNotes?.filter((n) => n.status === "closed").length || 0;
        const notesCloseRate = allNotes?.length
          ? Math.round((closedNotes / allNotes.length) * 100)
          : 0;
        const unsafeActs =
          allNotes?.filter((n) => n.type === "unsafeAct").length || 0;
        const unsafeConds =
          allNotes?.filter((n) => n.type === "unsafeCondition").length || 0;

        // TBT
        let tbtQuery = supabase
          .from("tbt_sessions")
          .select("attendees, actual_attend");
        if (!isMgr) tbtQuery = tbtQuery.in("project", projects);
        const { data: tbtData } = await tbtQuery;
        const totalAttend =
          tbtData?.reduce((sum, s) => sum + (s.actual_attend || 0), 0) || 0;
        const totalExpected =
          tbtData?.reduce((sum, s) => sum + (s.attendees || 0), 0) || 0;
        const attendRate = totalExpected
          ? Math.round((totalAttend / totalExpected) * 100)
          : 0;

        // آخر التصاريح
        let recentQuery = supabase
          .from("permits")
          .select("*")
          .eq("status", "active")
          .order("date", { ascending: false })
          .limit(5);
        if (!isMgr) recentQuery = recentQuery.in("project", projects);
        const { data: recentPermits } = await recentQuery;

        // جلب جميع التصاريح النشطة لحساب الأعداد لكل مشروع
        let allActiveQuery = supabase
          .from("permits")
          .select("project")
          .eq("status", "active");
        if (!isMgr) allActiveQuery = allActiveQuery.in("project", projects);
        const { data: allActivePermits } = await allActiveQuery;

        // آخر الحوادث
        let recentIncidents = [];
        if (isMgr) {
          const { data: inc } = await supabase
            .from("incidents")
            .select("*")
            .order("date", { ascending: false })
            .limit(3);
          recentIncidents = inc || [];
        }

        // جلب المشاريع
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*");

        setStats({
          activePermits: activePermits || 0,
          notesCloseRate,
          daysNoIncident: 45,
          attendRate,
          unsafeActs,
          unsafeConds,
          recentPermits: recentPermits || [],
          recentIncidents,
          projects: projectsData || [],
          allActivePermits: allActivePermits || [],
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isManager, getUserProjects]);

  if (loading)
    return (
      <div className="loading">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="error">
        {t("error")}: {error}
      </div>
    );

  const userName =
    user?.name?.split("/")[lang === "ar" ? 0 : 1]?.trim() || user?.name || "";

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">📊</span> {t("dashboard")}
          </div>
          <div className="page-subtitle">
            {t("welcomeMsg")} {userName}
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard
          icon="📋"
          value={stats.activePermits}
          label={t("activePermits")}
          trend="+3"
          trendUp
        />
        <KPICard
          icon="✅"
          value={`${stats.notesCloseRate}%`}
          label={t("notesClose")}
          trend={`${stats.notesCloseRate}%`}
          trendUp={stats.notesCloseRate >= 70}
        />
        <KPICard
          icon="🛡️"
          value={stats.daysNoIncident}
          label={t("daysNoIncident")}
          trend="+2"
          trendUp
        />
        <KPICard
          icon="🎓"
          value={`${stats.attendRate}%`}
          label={t("trainingAttend")}
          trend={`${stats.attendRate}%`}
          trendUp={stats.attendRate >= 80}
        />
      </div>

      {/* نظرة عامة على المشاريع */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🗺️ {t("projectsOverview")}</div>
        </div>
        <div className="projects-row">
          {stats.projects.map((p) => (
            <div
              key={p.id || p.key}
              className={`project-card ${!isManager() && !getUserProjects().includes(p.key) ? "dimmed" : ""}`}
            >
              <div className="project-icon">{p.icon || "🏗️"}</div>
              <div className="project-name">
                {lang === "ar" ? p.name_ar || p.name : p.name_en || p.name}
              </div>
              <div className="project-sub">
                {t("activePermits")}:{" "}
                {
                  stats.allActivePermits.filter((x) => x.project === p.key)
                    .length
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div className="card">
          <div className="card-header">
            <div className="card-title">📝 {t("fieldNotesChart")}</div>
          </div>
          <SimpleBarChart
            data={[
              { label: t("unsafeActCount"), value: stats.unsafeActs },
              { label: t("unsafeCondCount"), value: stats.unsafeConds },
            ]}
            colors={["var(--danger)", "var(--warning)"]}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">⚠️ {t("recentIncidents")}</div>
            {isManager() && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate("../incidents")}
              >
                {t("view")}
              </button>
            )}
          </div>
          {stats.recentIncidents.length ? (
            stats.recentIncidents.map((i) => (
              <div key={i.id} className="incident-item">
                <div
                  className="incident-dot"
                  style={{
                    background:
                      i.severity === "critical"
                        ? "var(--danger)"
                        : i.severity === "high"
                          ? "var(--warning)"
                          : "var(--accent)",
                  }}
                ></div>
                <div className="incident-info">
                  <div className="inc-title">{i.title}</div>
                  <div className="inc-sub">
                    {getProjectName(i.project, lang)} • {formatDate(i.date)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <div className="empty-text">{t("noData")}</div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">📋 {t("recentPermits")}</div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("../permits")}
          >
            {t("view")}
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("type")}</th>
                <th>{t("project")}</th>
                <th>{t("location")}</th>
                <th>{t("date")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentPermits.map((p, idx) => (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <TypeBadge
                      type={p.type}
                      typeMap={{
                        hot: t("hot"),
                        cold: t("cold"),
                        confined: t("confined"),
                        heights: t("heights"),
                        electrical: t("electrical"),
                      }}
                    />
                  </td>
                  <td>{getProjectName(p.project, lang)}</td>
                  <td>{p.location}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>
                    <span className="badge-status badge-active">
                      {t("active")}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.recentPermits.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
