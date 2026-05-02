import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { showToast, formatDate, translate } from "../utils/helpers";
import { StatusBadge } from "../components/Common/Badges";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import FiltersBar from "../components/Common/FiltersBar";
import { useNavigate } from "react-router-dom";
import Loading from "../components/UI/Loading";

export default function Licenses() {
  const { isManager, getUserProjects, user, getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const navigate = useNavigate();
  const t = (key) => translate(lang, key);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ project: "", status: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [projectsList, setProjectsList] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    project: "",
    issue_date: "",
    expiry_date: "",
    status: "valid",
  });

  // جلب التصاريح من Supabase مع مراعاة الصلاحيات
  const fetchLicenses = async () => {
    setLoading(true);
    let query = supabase.from("licenses").select("*");
    if (!isManager()) {
      const projects = getUserProjects();
      if (projects.length) query = query.in("project", projects);
    }
    // تطبيق الفلاتر

    if (filters.project && isManager())
      query = query.eq("project", filters.project);
    if (filters.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error) {
      showToast(error.message, "error");
    } else {
      setLicenses(data || []);
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
    fetchLicenses();
  }, [filters, isManager]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openAddModal = () => {
    setEditingLicense(null);
    setFormData({
      name: "",
      project: isManager() ? "" : getUserProjects()[0],
      issue_date: "",
      expiry_date: "",
      status: "valid",
    });
    setModalOpen(true);
  };

  const openEditModal = (license) => {
    setEditingLicense(license);
    setFormData({
      name: license.name,
      project: license.project,
      issue_date: license.issue_date,
      expiry_date: license.expiry_date,
      status: license.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.project ||
      !formData.issue_date ||
      !formData.expiry_date ||
      !formData.status
    ) {
      showToast(t("required"), "warning");
      return;
    }

    if (editingLicense) {
      const { error } = await supabase
        .from("licenses")
        .update(formData)
        .eq("id", editingLicense.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    } else {
      const { error } = await supabase.from("licenses").insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    }
    setModalOpen(false);
    fetchLicenses();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase
      .from("licenses")
      .delete()
      .eq("id", confirmDelete.id);
    if (error) showToast(error.message, "error");
    else showToast(t("deleted"), "success");
    setConfirmDelete(null);
    fetchLicenses();
  };

  const filterConfig = [
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
        { value: "valid", label: t("valid") },
        { value: "expiring", label: t("expiring") },
        { value: "expired", label: t("expired") },
      ],
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon"></span> {t("licenses")}
          </div>
        </div>
        {isManager() && (
          <button className="btn btn-primary" onClick={openAddModal}>
            {t("addLicense")}
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
                <th>{t("name")}</th>
                <th>{t("project")}</th>
                <th>{t("issue_date")}</th>
                <th>{t("expiry_date")}</th>
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
              ) : licenses.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                licenses.map((p, idx) => (
                  <tr key={p.id}>
                    <td>{idx + 1}</td>
                    <td>{p.name}</td>
                    <td>{getProjectName(p.project, lang)}</td>
                    <td>{formatDate(p.issue_date)}</td>
                    <td>{formatDate(p.expiry_date)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => navigate(`/licenses/${p.id}`)} // مسار مع المعرّف
                          // onClick={() => window.navigate?.("licenses", p.id)}
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
        title={editingLicense ? t("editLicense") : t("addLicense")}
      >
        <form id="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t("name")} *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
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
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t("issue_date")} *</label>
              <input
                type="date"
                className="form-control"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("expiry_date")} *</label>
              <input
                type="date"
                className="form-control"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
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
              <option value="valid">{t("valid")}</option>
              <option value="expiring">{t("expiring")}</option>
              <option value="expired">{t("expired")}</option>
            </select>
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
