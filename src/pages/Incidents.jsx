import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { showToast, formatDate, translate } from "../utils/helpers";
import { TypeBadge, SeverityBadge } from "../components/Common/Badges";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import FiltersBar from "../components/Common/FiltersBar";
import { useNavigate } from "react-router-dom";
import Loading from "../components/UI/Loading";

export default function Incidents() {
  const { isManager, getUserProjects, user, getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => translate(lang, key);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", project: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [projectsList, setProjectsList] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    severity: "",
    project: "",
    location: "",
    injured: "",
    date: "",
    description: "",
    action: "",
  });

  // جلب التصاريح من Supabase مع مراعاة الصلاحيات
  const fetchIncidents = async () => {
    setLoading(true);
    let query = supabase.from("incidents").select("*");
    if (!isManager()) {
      const projects = getUserProjects();
      if (projects.length) query = query.in("project", projects);
    }
    // تطبيق الفلاتر
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.project && isManager())
      query = query.eq("project", filters.project);
    if (filters.status) query = query.eq("status", filters.status);
    query = query.order("date", { ascending: false });

    const { data, error } = await query;
    if (error) {
      showToast(error.message, "error");
    } else {
      setIncidents(data || []);
    }
    setLoading(false);

    // جلب قائمة المشاريع لملء القوائم المنسدلة
    const { data: projs } = await supabase
      .from("projects")
      .select("key, name_ar, name_en");
    if (projs) setProjectsList(projs);
  };
  // ===== ROUTER =====

  useEffect(() => {
    fetchIncidents();
  }, [filters, isManager]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingIncident(null);
    setFormData({
      type: "",
      title: "",
      severity: "",
      project: isManager() ? "" : getUserProjects()[0],
      location: "",
      injured: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      action: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (incident) => {
    setEditingIncident(incident);
    setFormData({
      project: incident.project,
      location: incident.location,
      severity: incident.severity,
      title: incident.title,
      type: incident.type,
      date: incident.date,
      injured: incident.injured,
      description: incident.description || "",
      action: incident.action || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    if (
      !formData.severity ||
      !formData.project ||
      !formData.title ||
      !formData.location ||
      !formData.injured ||
      !formData.type ||
      !formData.date ||
      !formData.description ||
      !formData.action
    ) {
      showToast(t("required"), "warning");
      return;
    }

    if (editingIncident) {
      const { error } = await supabase
        .from("incidents")
        .update(formData)
        .eq("id", editingIncident.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    } else {
      const { error } = await supabase.from("incidents").insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    }
    setModalOpen(false);
    fetchIncidents();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("incidents")
      .delete()
      .eq("id", confirmDelete.id);
    if (error) showToast(error.message, "error");
    else showToast(t("deleted"), "success");
    setConfirmDelete(null);
    fetchIncidents();
  };

  const filterConfig = [
    {
      id: "type",
      type: "select",
      value: filters.type,
      placeholderKey: "allTypes",
      options: [
        { value: "injury", label: t("injury") },
        { value: "electrical", label: t("electrical") },
        { value: "slip", label: t("slip") },
        { value: "fall", label: t("fall") },
        { value: "fire", label: t("fire") },
        { value: "suffocation", label: t("suffocation") },
      ],
    },
    ...(isManager()
      ? [
          {
            id: "project",
            type: "select",
            value: filters.project,
            placeholderKey: "allProj",
            options: [
              ...projectsList.map((p) => ({
                value: p.key,
                label: lang === "ar" ? p.name_ar : p.name_en,
              })),
            ],
          },
        ]
      : []),
    {
      id: "severity",
      type: "select",
      value: filters.severity,
      placeholderKey: "allSeverity",
      options: [
        { value: "critical", label: t("critical") },
        { value: "high", label: t("high") },
        { value: "medium", label: t("medium") },
        { value: "low", label: t("low") },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon"></span> {t("incidentsManagement")}
          </div>
        </div>
        {isManager() && (
          <button className="btn btn-primary" onClick={openAddModal}>
            {t("addIncident")}
          </button>
        )}
      </div>

      <FiltersBar filters={filterConfig} onChange={handleFilterChange} />

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("title")}</th>
                <th>{t("type")}</th>
                <th>{t("project")}</th>
                <th>{t("injured")}</th>
                <th>{t("severity")}</th>
                <th>{t("date")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 32 }}>
                    <Loading />
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                incidents.map((p, idx) => (
                  <tr key={p.id}>
                    <td>{idx + 1}</td>
                    <td>{p.title}</td>
                    <td>
                      <TypeBadge
                        type={p.type}
                        typeMap={{
                          injury: t("injury"),
                          electrical: t("electrical"),
                          slip: t("slip"),
                          fall: t("fall"),
                          fire: t("fire"),
                          suffocation: t("suffocation"),
                        }}
                      />
                    </td>
                    <td>{getProjectName(p.project, lang)}</td>
                    <td>{p.injured}</td>
                    <td>
                      <SeverityBadge severity={p.severity} />
                    </td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => navigate(`/incidents/${p.id}`)} // مسار مع المعرّف
                          title={t("view")}
                        >
                          👁️
                        </button>
                        {isManager() && (
                          <>
                            <button
                              className="btn btn-primary btn-sm btn-icon"
                              onClick={() => openEditModal(p)}
                              title={t("edit")}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => setConfirmDelete(p)}
                              title={t("delete")}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal للإضافة / التعديل */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingIncident ? t("editIncident") : t("addIncident")}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            {isManager() && (
              <div className="form-group">
                <label className="form-label">{t("project")} *</label>
                <select
                  className="form-control"
                  value={formData.project}
                  onChange={(e) => {
                    const projectKey = e.target.value;
                    setFormData({
                      ...formData,
                      project: projectKey,
                    });
                  }}
                  required
                >
                  <option value="">--</option>
                  {projectsList.map((p) => {
                    return (
                      <option key={p.key} value={p.key}>
                        {lang === "ar" ? p.name_ar : p.name_en}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">{t("location")} *</label>
            <input
              className="form-control"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("title")} *</label>
            <input
              className="form-control"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t("injured")} *</label>
              <input
                className="form-control"
                value={formData.injured}
                onChange={(e) =>
                  setFormData({ ...formData, injured: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t("severity")} *</label>
              <select
                className="form-control"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
                required
              >
                <option value="">--</option>
                <option value="critical">{t("critical")}</option>
                <option value="high">{t("high")}</option>
                <option value="medium">{t("medium")}</option>
                <option value="low">{t("low")}</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t("type")} *</label>
              <select
                className="form-control"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              >
                <option value="">--</option>
                <option value="injury">{t("injury")}</option>
                <option value="electrical">{t("electrical")}</option>
                <option value="slip">{t("slip")}</option>
                <option value="fall">{t("fall")}</option>
                <option value="fire">{t("fire")}</option>
                <option value="suffocation">{t("suffocation")}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t("date")} *</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t("description")} *</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("actionTaken")} *</label>
            <textarea
              className="form-control"
              value={formData.action}
              onChange={(e) =>
                setFormData({ ...formData, action: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>

      {/* تأكيد الحذف */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        title={t("confirmDelete")}
        message={t("confirmDeleteMsg")}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
