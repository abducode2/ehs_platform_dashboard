import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { translate } from "../utils/helpers";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import { showToast } from "../utils/helpers";
import Loading from "../components/UI/Loading";

export default function Management() {
  const { isManager } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => translate(lang, key);

  // حالة إدارة المشاريع
  const [projects, setProjects] = useState([]);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState({
    ar: "",
    en: "",
    key: "",
  });
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(null);

  // حالة إدارة المراقبين
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorModalOpen, setSupervisorModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [supervisorForm, setSupervisorForm] = useState({
    username: "",
    name: "",
    password: "",
    project: "",
  });
  const [deleteSupervisorConfirm, setDeleteSupervisorConfirm] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true); // قائمة المشاريع للاختيار

  // جلب المشاريع والمراقبين
  useEffect(() => {
    if (isManager()) {
      fetchProjects();
      fetchSupervisors();
    }
    setLoading(false);
  }, [isManager]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("key");
    if (!error) setProjects(data || []);
  };

  const fetchSupervisors = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "supervisor");
    if (!error) setSupervisors(data || []);

    // جلب المشاريع لعمل قائمة منسدلة
    const { data: projs } = await supabase
      .from("projects")
      .select("key, name_ar, name_en");
    if (projs) setProjectsList(projs);
  };

  // إضافة مشروع جديد
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.key || !newProjectName.ar || !newProjectName.en) {
      showToast(t("required"), "warning");
      return;
    }
    const { error } = await supabase.from("projects").insert([
      {
        key: newProjectName.key,
        name_ar: newProjectName.ar,
        name_en: newProjectName.en,
      },
    ]);
    if (error) showToast(error.message, "error");
    else {
      showToast(t("added"), "success");
      setProjectModalOpen(false);
      setNewProjectName({ ar: "", en: "", key: "" });
      fetchProjects();
    }
  };

  // حذف مشروع
  const handleDeleteProject = async (projectKey) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("key", projectKey);
    if (error) showToast(error.message, "error");
    else {
      showToast(t("deleted"), "success");
      fetchProjects();
    }
    setDeleteProjectConfirm(null);
  };

  // إضافة أو تعديل مراقب
  const handleSaveSupervisor = async (e) => {
    e.preventDefault();
    if (
      !supervisorForm.username ||
      !supervisorForm.name ||
      !supervisorForm.project
    ) {
      showToast(t("required"), "warning");
      return;
    }
    if (!editingSupervisor && !supervisorForm.password) {
      showToast(t("passwordRequired"), "warning");
      return;
    }

    const dataToSave = {
      username: supervisorForm.username,
      name: supervisorForm.name,
      role: "supervisor",
      project: supervisorForm.project,
    };
    if (!editingSupervisor) {
      dataToSave.password_hash = supervisorForm.password;
      const { error } = await supabase.from("users").insert([dataToSave]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    } else {
      if (supervisorForm.password)
        dataToSave.password_hash = supervisorForm.password;
      const { error } = await supabase
        .from("users")
        .update(dataToSave)
        .eq("id", editingSupervisor.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    }
    setSupervisorModalOpen(false);
    fetchSupervisors();
  };

  const openAddSupervisor = () => {
    setEditingSupervisor(null);
    setSupervisorForm({ username: "", name: "", password: "", project: "" });
    setSupervisorModalOpen(true);
  };

  const openEditSupervisor = (sup) => {
    setEditingSupervisor(sup);
    setSupervisorForm({
      username: sup.username,
      name: sup.name,
      password: "",
      project: sup.project,
    });
    setSupervisorModalOpen(true);
  };

  const handleDeleteSupervisor = async () => {
    if (!deleteSupervisorConfirm) return;
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", deleteSupervisorConfirm.id);
    if (error) showToast(error.message, "error");
    else showToast(t("deleted"), "success");
    setDeleteSupervisorConfirm(null);
    fetchSupervisors();
  };

  if (!isManager()) {
    return (
      <div className="unauthorized">
        <div className="page-header">
          <div className="page-title">{t("unauthorized")}</div>
        </div>
        <div className="card">{t("unauthorizedMsg")}</div>
      </div>
    );
  }

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <Loading />
      </div>
    );
  return (
    <div className="management-page">
      <div className="page-header">
        <div className="page-title">
          <span className="icon">🏗️</span> {t("projectsAndSupervisors")}
        </div>
      </div>

      {/* إدارة المشاريع */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-header">
          <div className="card-title">🏗️ {t("manageProjects")}</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setProjectModalOpen(true)}
          >
            + {t("addProject")}
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("key")}</th>
                <th>{t("nameAr")}</th>
                <th>{t("nameEn")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj.key}>
                  <td>{proj.key}</td>
                  <td>{proj.name_ar}</td>
                  <td>{proj.name_en}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteProjectConfirm(proj)}
                    >
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* إدارة المراقبين */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">👷 {t("manageSupervisors")}</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={openAddSupervisor}
          >
            + {t("addSupervisor")}
          </button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t("username")}</th>
                <th>{t("name")}</th>
                <th>{t("project")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {supervisors.map((sup) => (
                <tr key={sup.id}>
                  <td>{sup.username}</td>
                  <td>{sup.name}</td>
                  <td>
                    {projectsList.find((p) => p.key === sup.project)?.[
                      lang === "ar" ? "name_ar" : "name_en"
                    ] || sup.project}
                  </td>
                  <td>
                    <div className="td-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditSupervisor(sup)}
                      >
                        {t("edit")}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteSupervisorConfirm(sup)}
                      >
                        {t("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {supervisors.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    {t("noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* مودال إضافة/تعديل مشروع */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={t("addProject")}
      >
        <form id="modal-form" onSubmit={handleAddProject}>
          <div className="form-group">
            <label className="form-label">{t("key")} (مثل: new_project)</label>
            <input
              className="form-control"
              value={newProjectName.key}
              onChange={(e) =>
                setNewProjectName({ ...newProjectName, key: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("nameAr")}</label>
            <input
              className="form-control"
              value={newProjectName.ar}
              onChange={(e) =>
                setNewProjectName({ ...newProjectName, ar: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("nameEn")}</label>
            <input
              className="form-control"
              value={newProjectName.en}
              onChange={(e) =>
                setNewProjectName({ ...newProjectName, en: e.target.value })
              }
              required
            />
          </div>
        </form>
      </Modal>

      {/* مودال إضافة/تعديل مراقب */}
      <Modal
        isOpen={supervisorModalOpen}
        onClose={() => setSupervisorModalOpen(false)}
        title={editingSupervisor ? t("editSupervisor") : t("addSupervisor")}
      >
        <form id="modal-form" onSubmit={handleSaveSupervisor}>
          <div className="form-group">
            <label className="form-label">{t("username")} *</label>
            <input
              className="form-control"
              value={supervisorForm.username}
              onChange={(e) =>
                setSupervisorForm({
                  ...supervisorForm,
                  username: e.target.value,
                })
              }
              required
              disabled={!!editingSupervisor}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("name")} *</label>
            <input
              className="form-control"
              value={supervisorForm.name}
              onChange={(e) =>
                setSupervisorForm({ ...supervisorForm, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              {t("password")} {!editingSupervisor && "*"}
            </label>
            <input
              type="password"
              className="form-control"
              value={supervisorForm.password}
              onChange={(e) =>
                setSupervisorForm({
                  ...supervisorForm,
                  password: e.target.value,
                })
              }
              required={!editingSupervisor}
              placeholder={editingSupervisor ? t("leaveBlankToKeep") : ""}
            />
          </div>
          <div className="form-group">
            <label className="form-label">{t("project")} *</label>
            <select
              className="form-control"
              value={supervisorForm.project}
              onChange={(e) =>
                setSupervisorForm({
                  ...supervisorForm,
                  project: e.target.value,
                })
              }
              required
            >
              <option value="">--</option>
              {projectsList.map((p) => (
                <option key={p.key} value={p.key}>
                  {lang === "ar" ? p.name_ar : p.name_en}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* تأكيد حذف مشروع */}
      <ConfirmModal
        isOpen={!!deleteProjectConfirm}
        title={t("confirmDelete")}
        message={`${t("deleteProjectConfirm")} ${deleteProjectConfirm?.[lang === "ar" ? "name_ar" : "name_en"]}?`}
        onConfirm={() => handleDeleteProject(deleteProjectConfirm.key)}
        onCancel={() => setDeleteProjectConfirm(null)}
      />

      {/* تأكيد حذف مراقب */}
      <ConfirmModal
        isOpen={!!deleteSupervisorConfirm}
        title={t("confirmDelete")}
        message={`${t("deleteSupervisorConfirm")} ${deleteSupervisorConfirm?.name}?`}
        onConfirm={handleDeleteSupervisor}
        onCancel={() => setDeleteSupervisorConfirm(null)}
      />
    </div>
  );
}
