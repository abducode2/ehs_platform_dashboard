// src/pages/Notes.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../contexts/ThemeLangContext";
import { T } from "../utils/translations";
import { showToast, formatDate } from "../utils/helpers";
import {
  StatusBadge,
  SeverityBadge,
  TypeBadge,
} from "../components/Common/Badges";
import Modal from "../components/UI/Modal";
import ConfirmModal from "../components/UI/ConfirmModal";
import FiltersBar from "../components/Common/FiltersBar";
import Loading from "../components/UI/Loading";

export default function Notes() {
  const { isManager, getUserProjects, getProjectName } = useAuth();
  const { lang } = useThemeLang();
  const t = (key) => {
    const dict = T[lang];
    if (!dict) return key;
    return dict[key] || key;
  };

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    project: "",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    project: "",
    location: "",
    severity: "",
    description: "",
    status: "open",
    date: new Date().toISOString().split("T")[0],
  });

  const [projectsList, setProjectsList] = useState([]);

  const fetchNotes = async () => {
    setLoading(true);
    let query = supabase.from("notes").select("*");
    if (!isManager()) query = query.in("project", getUserProjects());
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.severity) query = query.eq("severity", filters.severity);
    if (filters.project && isManager())
      query = query.eq("project", filters.project);
    query = query.order("date", { ascending: false });

    const { data, error } = await query;
    if (!error) setNotes(data || []);
    setLoading(false);

    // جلب المشاريع ديناميكياً
    const { data: projs } = await supabase
      .from("projects")
      .select("key, name_ar, name_en");
    if (projs) setProjectsList(projs);
  };

  useEffect(() => {
    fetchNotes();
  }, [filters, isManager]);

  const handleFilterChange = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));
  const openAddModal = () => {
    setEditingNote(null);
    setFormData({
      ...formData,
      project: isManager() ? "" : getUserProjects()[0],
      status: "open",
    });
    setModalOpen(true);
  };
  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({ ...note });
    setModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.type ||
      !formData.title ||
      !formData.project ||
      !formData.severity
    ) {
      showToast(t("required"), "warning");
      return;
    }
    if (editingNote) {
      const { error } = await supabase
        .from("notes")
        .update(formData)
        .eq("id", editingNote.id);
      if (error) showToast(error.message, "error");
      else showToast(t("updated"), "success");
    } else {
      const { error } = await supabase.from("notes").insert([formData]);
      if (error) showToast(error.message, "error");
      else showToast(t("added"), "success");
    }
    setModalOpen(false);
    fetchNotes();
  };
  const handleDelete = async () => {
    if (!confirmDelete) return;
    await supabase.from("notes").delete().eq("id", confirmDelete.id);
    showToast(t("deleted"), "success");
    setConfirmDelete(null);
    fetchNotes();
  };

  const filterConfig = [
    {
      id: "type",
      type: "select",
      value: filters.type,
      placeholderKey: "allTypes",
      options: [
        { value: "unsafeAct", label: t("unsafeAct") },
        { value: "unsafeCondition", label: t("unsafeCondition") },
      ],
    },
    {
      id: "severity",
      type: "select",
      value: filters.severity,
      placeholderKey: "allSev",
      options: [
        { value: "critical", label: t("critical") },
        { value: "high", label: t("high") },
        { value: "medium", label: t("medium") },
        { value: "low", label: t("low") },
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
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">
            <span className="icon">📝</span> {t("notesManagement")}
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          + {t("addNote")}
        </button>
      </div>
      <FiltersBar filters={filterConfig} onChange={handleFilterChange} />
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t("type")}</th>
                <th>{t("title")}</th>
                <th>{t("project")}</th>
                <th>{t("severity")}</th>
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
              ) : notes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: 32 }}>
                    {t("noData")}
                  </td>
                </tr>
              ) : (
                notes.map((note, idx) => (
                  <tr key={note.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <TypeBadge
                        type={note.type}
                        typeMap={{
                          unsafeAct: t("unsafeAct"),
                          unsafeCondition: t("unsafeCondition"),
                        }}
                      />
                    </td>
                    <td>{note.title}</td>
                    <td>{getProjectName(note.project, lang)}</td>
                    <td>
                      <SeverityBadge severity={note.severity} />
                    </td>
                    <td>{formatDate(note.date)}</td>
                    <td>
                      <StatusBadge status={note.status} />
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => window.navigate?.("/notes", note.id)}
                          title={t("view")}
                        >
                          👁️
                        </button>
                        {isManager() && (
                          <>
                            <button
                              className="btn btn-primary btn-sm btn-icon"
                              onClick={() => openEditModal(note)}
                              title={t("edit")}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-danger btn-sm btn-icon"
                              onClick={() => setConfirmDelete(note)}
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
        title={editingNote ? t("edit") : t("addNote")}
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
                <option value="unsafeAct">{t("unsafeAct")}</option>
                <option value="unsafeCondition">{t("unsafeCondition")}</option>
              </select>
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

          {isManager() && (
            <div className="form-group">
              <label className="form-label">{t("project")} *</label>
              <select
                className="form-control"
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
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
          )}

          <div className="form-group">
            <label className="form-label">{t("location")}</label>
            <input
              className="form-control"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("description")}</label>
            <textarea
              className="form-control"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {isManager() && (
            <div className="form-group">
              <label className="form-label">{t("status")}</label>
              <select
                className="form-control"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="open">{t("open")}</option>
                <option value="closed">{t("closed")}</option>
              </select>
            </div>
          )}

          {/* حقل التاريخ مخفي (يتم تعيينه تلقائياً) */}
          <input type="hidden" value={formData.date} />
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
