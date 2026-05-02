import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { showToast, formatDate, translate } from "../utils/helpers";
import { StatusBadge, TypeBadge } from "../components/Common/Badges";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import FiltersBar from "../components/Common/FiltersBar";
import { useNavigate } from "react-router-dom";
import Loading from "../components/UI/Loading";

export default function Permits() {
  const { isManager, getUserProjects, user, getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => translate(lang, key);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: "", project: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    project: "",
    location: "",
    supervisor: "",
    date: "",
    description: "",
    status: "active",
  });

  // جلب التصاريح من Supabase مع مراعاة الصلاحيات
  const fetchPermits = async () => {
    setLoading(true);
    let query = supabase.from("permits").select("*");
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
      setPermits(data || []);
    }
    setLoading(false);

    // جلب قائمة المشاريع لملء القوائم المنسدلة
    const { data: projs } = await supabase
      .from("projects")
      .select("key, name_ar, name_en");
    if (projs) setProjectsList(projs);

    // جلب المراقبين لربطهم بالمشاريع
    const { data: sups } = await supabase
      .from("users")
      .select("name, project")
      .eq("role", "supervisor");
    if (sups) setSupervisorsList(sups);
  };
  // ===== ROUTER =====

  useEffect(() => {
    fetchPermits();
  }, [filters, isManager]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingPermit(null);
    setFormData({
      type: "",
      project: isManager() ? "" : getUserProjects()[0],
      location: "",
      supervisor: user?.name || "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      status: "active",
    });
    setModalOpen(true);
  };

  const openEditModal = (permit) => {
    setEditingPermit(permit);
    setFormData({
      type: permit.type,
      project: permit.project,
      location: permit.location,
      supervisor: permit.supervisor,
      date: permit.date,
      description: permit.description || "",
      status: permit.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.type ||
      !formData.project ||
      !formData.location ||
      !formData.supervisor ||
      !formData.date
    ) {
      showToast(t("required"), "warning");
      return;
    }

    if (editingPermit) {
      const { error } = await supabase
        .from("permits")
        .update(formData)
        .eq("id", editingPermit.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    } else {
      const { error } = await supabase.from("permits").insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    }
    setModalOpen(false);
    fetchPermits();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("permits")
      .delete()
      .eq("id", confirmDelete.id);
    if (error) showToast(error.message, "error");
    else showToast(t("deleted"), "success");
    setConfirmDelete(null);
    fetchPermits();
  };

  const filterConfig = [
    {
      id: "type",
      type: "select",
      value: filters.type,
      placeholderKey: "allTypes",
      options: [
        { value: "hot", label: t("hot") },
        { value: "cold", label: t("cold") },
        { value: "confined", label: t("confined") },
        { value: "heights", label: t("heights") },
        { value: "electrical", label: t("electrical") },
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
      id: "status",
      type: "select",
      value: filters.status,
      placeholderKey: "allStatus",
      options: [
        { value: "active", label: t("active") },
        { value: "closed", label: t("closed") },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon"></span> {t("permitsManagement")}
          </div>
        </div>
        {isManager() && (
          <button className="btn btn-primary" onClick={openAddModal}>
            {t("addPermit")}
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
                <th>{t("type")}</th>
                <th>{t("project")}</th>
                <th>{t("location")}</th>
                <th>{t("supervisor")}</th>
                <th>{t("date")}</th>
                <th>{t("status")}</th>
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
              ) : permits.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                permits.map((p, idx) => (
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
                    <td>{p.supervisor}</td>
                    <td>{formatDate(p.date)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => navigate(`/permits/${p.id}`)} // مسار مع المعرّف
                          // onClick={() => window.navigate?.("permits", p.id)}
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
        title={editingPermit ? t("editPermit") : t("addPermit")}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
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
                <option value="hot">{t("hot")}</option>
                <option value="cold">{t("cold")}</option>
                <option value="confined">{t("confined")}</option>
                <option value="heights">{t("heights")}</option>
                <option value="electrical">{t("electrical")}</option>
              </select>
            </div>
            {isManager() && (
              <div className="form-group">
                <label className="form-label">{t("project")} *</label>
                <select
                  className="form-control"
                  value={formData.project}
                  onChange={(e) => {
                    const projectKey = e.target.value;
                    const sup = supervisorsList.find(
                      (s) => s.project === projectKey,
                    );
                    setFormData({
                      ...formData,
                      project: projectKey,
                      supervisor: sup ? sup.name : "",
                    });
                  }}
                  required
                >
                  <option value="">--</option>
                  {projectsList.map((p) => {
                    const sup = supervisorsList.find(
                      (s) => s.project === p.key,
                    );
                    return (
                      <option key={p.key} value={p.key}>
                        {lang === "ar" ? p.name_ar : p.name_en}{" "}
                        {/* {sup ? `(${sup.name})` : ""} */}
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
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t("supervisor")} *</label>
              <select
                className="form-control"
                value={formData.supervisor}
                onChange={(e) =>
                  setFormData({ ...formData, supervisor: e.target.value })
                }
                required
              >
                <option value="">--</option>
                {supervisorsList.map((sup, idx) => (
                  <option key={idx} value={sup.name}>
                    {sup.name}
                    {/* {sup.name} ({getProjectName(sup.project, lang)}) */}
                  </option>
                ))}
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
            <label className="form-label">{t("status")}</label>
            <select
              className="form-control"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="active">{t("active")}</option>
              <option value="closed">{t("closed")}</option>
            </select>
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
